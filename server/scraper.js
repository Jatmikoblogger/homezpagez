const { url, max_iter, max_retries } = require("./constants");
const { sleep, curlContent } = require("./utils");
const NC = require("node-cache");
const Cache = new NC({ checkperiod: 0 });

const getToken = async (query)   
 => {
  try {
    let token = null;
    let reqUrl = url + "?";
    let params = new URLSearchParams({
      q: query,
      t: "h_",
      iax: "images",
      ia: "images",
    }).toString();
    let res = await curlContent(reqUrl + params);

    token = res.match(/vqd=([\d-]+)\&/)[1];   

    if (!token) {
      throw new Error("Failed to get token");
    }
    return token;
  } catch (error) {
    console.error("Error in getToken:", error);
    throw error; // Re-throw error untuk ditangani di fungsi yang memanggil
  }
};

const getImages = async (query, moderate, retries, iterations) => {
  try {
    let reqUrl = url + "i.js?";
    let keywords = query;
    let p = moderate ? 1 : -1;
    let attempt = 0;
    if (!retries) retries = max_retries;
    if (!iterations) iterations = max_iter;

    let results = [];
    let dataCache = Cache.get("images::" + keywords);

    if (dataCache == undefined) {
      let token = await getToken(keywords);
      let params = new URLSearchParams({
        l: "wt-wt",
        o: "json",
        q: keywords,
        vqd: token,
        f: ",,,",
        p: "" + p,
      }).toString();

      let data = null;
      let itr = 0;

      while (itr < iterations) {
        while (true) {
          try {
            let response = await curlContent(reqUrl + params);
            data = response;
            data = await JSON.parse(data);
            if (!data.results) throw new Error("No results");
            break;
          } catch (error) {
            console.error("Error fetching images:", error)
            attempt += 1;
            if (attempt > retries) {
              Cache.set("images::" + keywords, results);
              return results; // Kembalikan hasil meskipun kosong
            }
            await sleep(5000);
            continue;
          }
        }

        results = [...results, ...data.results];
        for (let i = 0; i < results.length; i++) {
          results[i]["title"] = results[i]["title"].replace(/\.+/gi, "");
        }
        Cache.set("images::" + keywords, results);
        if (!data.next) {
          return   
 results;
        }
        reqUrl = url + data["next"];
        itr += 1;
        attempt = 0;
      }
    } else {
      results = dataCache;
    }
    return results;
  } catch (error) {
    console.error("Error in getImages:", error);
    return []; // Kembalikan array kosong jika terjadi error
  } finally {
    Cache.close();
  }
};

const getSentences = async (query) => {
  try {
    let reqUrl = "https://html.duckduckgo.com/html/?";
    let results = [];
    let dataCache = Cache.get("text::" + query);
    if (dataCache == undefined) {
      let params = new URLSearchParams({
        q: query,
      }).toString();
      let response = await curlContent(reqUrl + params);
      if (response != "err") {
        response = response.match(
          /(?<=\<a\sclass="result__snippet.*?\>).*?(?=\<\/a\>)/g
        );
        if (response != null) {
          response.forEach((e) => {
            e = e.replace(/\.+/g, ".");
            e = removeCommonwords(e);
            results.push(e);
          });
        }
      }
      if (results.length == 0) {
        results[0] = `Hello, in this particular article you will provide several interesting pictures of <b>${query}</b>. We found many exciting and extraordinary <b>${query}</b> pictures that can be tips, input and information intended for you. In addition to be able to the <b>${query}</b> main picture, we also collect some other related images. Find typically the latest and best <b>${query}</b> images here that many of us get selected from plenty of other images.`;   

        // ... (dan seterusnya) ...
      }
      Cache.set("text::" + query, results);
    } else {
      results = dataCache;
    }
    return results;
  } catch (error) {
    console.error("Error in getSentences:", error);
    return []; // Kembalikan array kosong jika terjadi error
  } finally {
    Cache.close();
  }
};

const removeCommonwords = (str) => {
  let cWords = [
    " a",
    "able",
    "about",
    "above",
    "abroad",
    "according",
    "accordingly",
    "across",
    "actually",
    "adj",
    "after",
    "afterwards",
    "again",
    "against",
    "ago",
    "ahead",
    "ain't",
    "all",
    "allow",
    "allows",
    "almost",
    "alone",
    "along",
    "alongside",
    "already",
    "also",
    "although",
    "always",
    "am",
    "amid",
    "amidst",
    "among",
    "amongst",
    "an",
    "and",
    "another",
    "any",
    "anybody",
    "anyhow",
    "anyone",
    "anything",
    "anyway",
    "anyways",
    "anywhere",
    "apart",
    "appear",
    "appreciate",
    "appropriate",
    "are",
    "aren't",
    "around",
    "as",
    "a's",
    "aside",
    "ask",
    "asking",
    "associated",
    "at",
    "available",
    "away",
    "awfully",
    " b ",
    "back",
    "backward",
    "backwards",
    "be",
    "became",
    "because",
    "become",
    "becomes",
    "becoming",
    "been",
    "before",
    "beforehand",
    "begin",
    "behind",
    "being",
    "believe",
    "below",
    "beside",
    "besides",
    "best",
    "better",
    "between",
    "beyond",
    "both",
    "brief",
    "but",
    "by",
    "c",
    "came",
    "can",
    "cannot",
    "cant",
    "can't",
    "caption",
    "cause",
    "causes",
    "certain",
    "certainly",
    "changes",
    "clearly",
    "c'mon",
    "co",
    "co.",
    "com",
    "come",
    "comes",
    "concerning",
    "consequently",
    "consider",
    "considering",
    "contain",
    "containing",
    "contains",
    "corresponding",
    "could",
    "couldn't",
    "course",
    "c's",
    "currently",
    "d",
    "dare",
    "daren't",
    "definitely",
    "described",
    "despite",
    "did",
    "didn't",
    "different",
    "directly",
    "do",
    "does",
    "doesn't",
    "doing",
    "done",
    "don't",
    "down",
    "downwards",
    "during",
    "e",
    "each",
    "edu",
    "eg",
    "eight",
    "eighty",
    "either",
    "else",
    "elsewhere",
    "end",
    "ending",
    "enough",
    "entirely",
    "especially",
    "et",
    "etc",
    "even",
    "ever",
    "evermore",
    "every",
    "everybody",
    "everyone",
    "everything",
    "everywhere",
    "ex",
    "exactly",
    "example",
    "except",
    "f",
    "fairly",
    "far",
    "farther",
    "few",
    "fewer",
    "fifth",
    "first",
    "five",
    "followed",
    "following",
    "follows",
    "for",
    "forever",
    "former",
    "formerly",
    "forth",
    "forward",
    "found",
    "four",
    "from",
    "further",
    "furthermore",
    "g",
    "get",
    "gets",
    "getting",
    "given",
    "gives",
    "go",
    "goes",
    "going",
    "gone",
    "got",
    "gotten",
    "greetings",
    "h",
    "had",
    "hadn't",
    "half",
    "happens",
    "hardly",
    "has",
    "hasn't",
    "have",
    "haven't",
    "having",
    "he",
    "he'd",
    "he'll",
    "hello",
    "help",
    "hence",
    "her",
    "here",
    "hereafter",
    "hereby",
    "herein",
    "here's",
    "hereupon",
    "hers",
    "herself",
    "he's",
    "hi",
    "him",
    "himself",
    "his",
    "hither",
    "hopefully",
    "how",
    "howbeit",
    "however",
    "hundred",
    "i",
    "i'd",
    "ie",
    "if",
    "ignored",
    "i'll",
    "i'm",
    "immediate",
    "in",
    "inasmuch",
    "inc",
    "inc.",
    "indeed",
    "indicate",
    "indicated",
    "indicates",
    "inner",
    "inside",
    "insofar",
    "instead",
    "into",
    "inward",
    "is",
    "isn't",
    "it",
    "it'd",
    "it'll",
    "its",
    "it's",
    "itself",
    "i've",
    "j",
    "just",
    "k",
    "keep",
    "keeps",
    "kept",
    "know",
    "known",
    "knows",
    "l",
    "last",
    "lately",
    "later",
    "latter",
    "latterly",
    "least",
    "less",
    "lest",
    "let",
    "let's",
    "like",
    "liked",
    "likely",
    "likewise",
    "little",
    "'ll",
    "look",
    "looking",
    "looks",
    "low",
    "lower",
    "ltd",
    "m",
    "made",
    "mainly",
    "make",
    "makes",
    "many",
    "may",
    "maybe",
    "mayn't",
    "me",
    "mean",
    "meantime",
    "meanwhile",
    "merely",
    "might",
    "mightn't",
    "mine",
    "minus",
    "miss",
    "more",
    "moreover",
    "most",
    "mostly",
    "mr",
    "mrs",
    "much",
    "must",
    "mustn't",
    "my",
    "myself",
    "n",
    "name",
    "namely",
    "nd",
    "near",
    "nearly",
    "necessary",
    "need",
    "needn't",
    "needs",
    "neither",
    "never",
    "neverf",
    "neverless",
    "nevertheless",
    "new",
    "next",
    "nine",
    "ninety",
    "no",
    "nobody",
    "non",
    "none",
    "nonetheless",
    "noone",
    "no-one",
    "nor",
    "normally",
    "not",
    "nothing",
    "notwithstanding",
    "novel",
    "now",
    "nowhere",
    "o",
    "obviously",
    "of",
    "off",
    "often",
    "oh",
    "ok",
    "okay",
    "old",
    "on",
    "once",
    "one",
    "ones",
    "one's",
    "only",
    "onto",
    "opposite",
    "or",
    "other",
    "others",
    "otherwise",
    "ought",
    "oughtn't",
    "our",
    "ours",
    "ourselves",
    "out",
    "outside",
    "over",
    "overall",
    "own",
    "particular",
    "particularly",
    "past",
    "per",
    "perhaps",
    "placed",
    "please",
    "plus",
    "possible",
    "presumably",
    "probably",
    "provided",
    "provides",
    "q",
    "que",
    "quite",
    "qv",
    "r",
    "rather",
    "rd",
    "re",
    "really",
    "reasonably",
    "recent",
    "recently",
    "regarding",
    "regardless",
    "regards",
    "relatively",
    "respectively",
    "right",
    "round",
    "s",
    "said",
    "same",
    "saw",
    "say",
    "saying",
    "says",
    "second",
    "secondly",
    "see",
    "seeing",
    "seem",
    "seemed",
    "seeming",
    "seems",
    "seen",
    "self",
    "selves",
    "sensible",
    "sent",
    "serious",
    "seriously",
    "seven",
    "several",
    "shall",
    "shan't",
    "she",
    "she'd",
    "she'll",
    "she's",
    "should",
    "shouldn't",
    "since",
    "six",
    "so",
    "some",
    "somebody",
    "someday",
    "somehow",
    "someone",
    "something",
    "sometime",
    "sometimes",
    "somewhat",
    "somewhere",
    "soon",
    "sorry",
    "specified",
    "specify",
    "specifying",
    "still",
    "sub",
    "such",
    "sup",
    "sure",
    "t",
    "take",
    "taken",
    "taking",
    "tell",
    "tends",
    "th",
    "than",
    "thank",
    "thanks",
    "thanx",
    "that",
    "that'll",
    "thats",
    "that's",
    "that've",
    "'ve",
    "the",
    "their",
    "theirs",
    "them",
    "themselves",
    "then",
    "thence",
    "there",
    "thereafter",
    "thereby",
    "there'd",
    "therefore",
    "therein",
    "there'll",
    "there're",
    "theres",
    "there's",
    "thereupon",
    "there've",
    "these",
    "they",
    "they'd",
    "they'll",
    "they're",
    "they've",
    "thing",
    "things",
    "think",
    "third",
    "thirty",
    "this",
    "thorough",
    "thoroughly",
    "those",
    "though",
    "three",
    "through",
    "throughout",
    "thru",
    "thus",
    "till",
    "to",
    "together",
    "too",
    "took",
    "toward",
    "towards",
    "tried",
    "tries",
    "truly",
    "try",
    "trying",
    "t's",
    "twice",
    "two",
    "u",
    "un",
    "under",
    "underneath",
    "undoing",
    "unfortunately",
    "unless",
    "unlike",
    "unlikely",
    "until",
    "unto",
    "up",
    "upon",
    "upwards",
    "us",
    "use",
    "used",
    "useful",
    "uses",
    "using",
    "usually",
    "v",
    "value",
    "various",
    "versus",
    "very",
    "via",
    "viz",
    "vs",
    "w",
    "want",
    "wants",
    "was",
    "wasn't",
    "way",
    "we",
    "we'd",
    "welcome",
    "well",
    "we'll",
    "went",
    "were",
    "we're",
    "weren't",
    "we've",
    "what",
    "whatever",
    "what'll",
    "what's",
    "what've",
    "when",
    "whence",
    "whenever",
    "where",
    "whereafter",
    "whereas",
    "whereby",
    "wherein",
    "where's",
    "whereupon",
    "wherever",
    "whether",
    "which",
    "whichever",
    "while",
    "whilst",
    "whither",
    "who",
    "who'd",
    "whoever",
    "whole",
    "who'll",
    "whom",
    "whomever",
    "who's",
    "whose",
    "why",
    "will",
    "willing",
    "wish",
    "with",
    "within",
    "without",
    "wonder",
    "won't",
    "would",
    "wouldn't",
    "x",
    "y",
    "yes",
    "yet",
    "you",
    "you'd",
    "you'll",
    "your",
    "you're",
    "you've",
    "yours",
    "yourself",
    "yourselves",
    "you've",
    "z",
    "zero",
    "ada",
    "adalah",
    "agak",
    "agar",
    "akan",
    "aku",
    "amat",
    "anda",
    "apa",
    "apabila",
    "atau",
    "bahwa",
    "bagai",
    "baru",
    "beberapa",
    "begitu",
    "begini",
    "bila",
    "belum",
    "betapa",
    "banyak",
    "boleh",
    "cara",
    "cuma",
    "dan",
    "dalam",
    "dari",
    "dapat",
    "demikian",
    "dengan",
    "di",
    "dia",
    "hanya",
    "harus",
    "ialah",
    "ini",
    "ingin",
    "itu",
    "hanya",
    "jika",
    "juga",
    "hendak",
    "kali",
    "kalau",
    "kami",
    "kan",
    "karena",
    "ke",
    "kelak",
    "kemudian",
    "kenapa",
    "kepada",
    "kini",
    "ku",
    "lah",
    "lain-lain",
    "lagi",
    "lalu",
    "lama",
    "lantas",
    "maka",
    "mana",
    "masa",
    "masih",
    "mau",
    "me",
    "mereka",
    "merupakan",
    "meng",
    "mengapa",
    "mesti",
    "mu",
    "namun",
    "nan",
    "nun",
    "nya",
    "orang",
    "pada",
    "paling",
    "pasti",
    "para",
    "pen",
    "pengen",
    "pernah",
    "saat",
    "saja",
    "sana",
    "sang",
    "sangat",
    "saya",
    "sebagainya",
    "sedang",
    "sehingga",
    "selain",
    "selalu",
    "seluruh",
    "sekali",
    "sekarang",
    "sementara",
    "semua",
    "senantiasa",
    "seorang",
    "seseorang",
    "seperti",
    "serba",
    "sering",
    "serta",
    "sesuatu",
    "si",
    "sini",
    "situ",
    "suatu",
    "sudah",
    "supaya",
    "tahun",
    "tanpa",
    "telah",
    "terus",
    "untuk",
    "yakni",
    "yaitu",
    "yang",
  ];

  let sentences;
  try {
    let rgx = new RegExp(cWords.join(" | "), "gi");
    sentences = str.replace(rgx, " ");
    sentences = sentences.replace(/\s+/g, " ");
    return sentences;
  } catch (e) {}
};

module.exports = { getImages, getSentences };

class Color {
  constructor(r = 0, g = 0, b = 0, a = 1, isHsl = false) {
    if (typeof r === 'string') {
      if (r[0] === '#') {
        this.hex = r;
        this.update('hex');
      } else if (r.substr(0, 5).match('rgba?\(')) {
        const rgb = r.substring(4, r.length - 1).split();
        this._r = parseInt(rgb[0]);
        this._g = parseInt(rgb[1]);
        this._b = parseInt(rgb[2]);
        this._a = rgb.length === 4 ? parseInt(rgb[3]) : 1;
        this.update('rgb');
      } else if (r.substr(0, 5).match('hsla?\(')) {
        const hsl = r
          .substring(4, r.length - 1)
          .replace(/\%/g, '')
          .split();
        this._r = parseInt(hsl[0]);
        this._g = parseInt(hsl[1]);
        this._b = parseInt(hsl[2]);
        this._a = hsl.length === 4 ? parseInt(hsl[3]) : 1;
        this.update('hsl');
      }
    } else if (isHsl) {
      this._h = r;
      this._s = g;
      this._l = b;
      this._a = a;
      this.update('hsl');
    } else {
      this._r = r;
      this._g = g;
      this._b = b;
      this._a = a;
      this.update('rgb');
    }
  }

  //
  // Sync values
  //
  update(from) {
    if (from === 'hex') {
      const rgb = Color.hexToRgb(this.hex);
      this._r = rgb.r;
      this._g = rgb.g;
      this._b = rgb.b;
      this._a = rgb.a;
      const hsl = Color.rgbToHsl(this._r, this._g, this._b);
      this._h = hsl.h;
      this._s = hsl.s;
      this._l = hsl.l;
    } else if (from === 'hsl') {
      const rgb = Color.hslToRgb(this._h, this._s, this._l);
      this._r = rgb.r;
      this._g = rgb.g;
      this._b = rgb.b;
      this._hex = Color.rgbToHex(this._r, this._g, this._b, this._a);
    } else if (from === 'rgb') {
      const hsl = Color.rgbToHsl(this._r, this._g, this._b);
      this._h = hsl.h;
      this._s = hsl.s;
      this._l = hsl.l;
      this._hex = Color.rgbToHex(this._r, this._g, this._b, this._a);
    }
  }

  //
  // Conversions
  //
  static normalise(v, isAlpha = false) {
    if (isAlpha) {
      v = Math.max(Math.min(v, 1), 0);
      v = parseFloat(v.toFixed(3));
      return v;
    } else if (v[0] === '#') {
      v = v.substr(1).toLowerCase();
      v = v.replace(/[^0-9a-f]/g, 'f');
      if (v.length === 3) {
        v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2];
      } else if (v.length === 4) {
        v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
      }
      if (v.length === 8 && v.substr(6, 2) === 'ff') {
        v = v.substr(0, 6);
      }
      return '#' + v;
    } else {
      v = Math.floor(v);
      v = Math.max(Math.min(v, 255), 0);
      return v;
    }
  }
  
  static hexToRgb(hex) {
    if (hex[0] !== '#' && [4, 5, 7, 8, 9].indexOf(hex.length) === -1) {
      console.error('Invalid hex');
      return;
    }
    
    hex = Color.normalise(hex);
    return {
      r: parseInt(hex.substr(1, 2), 16),
      g: parseInt(hex.substr(3, 2), 16),
      b: parseInt(hex.substr(5, 2), 16),
      a: hex.length < 8 ? 1 : Color.normalise(parseInt(hex.substr(7, 2), 16) / 255, true)
    };
  }

  static rgbToHex(r, g, b, a = 255) {
    return Color.normalise(
      r.toString(16).padStart(2, 0) +
      g.toString(16).padStart(2, 0) +
      b.toString(16).padStart(2, 0) +
      Math.floor(a * 255).toString(16).padStart(2, 0)
    );
  }

  static rgbToHsl(r, g, b, a = 1) {
    r /= 255;
    g /= 255;
    b /= 255;

    const
      cmin = Math.min(r, g, b),
      cmax = Math.max(r, g, b),
      delta = cmax - cmin;

    let
      h = 0,
      s = 0,
      l = 0;

    if (delta === 0) {
      h = 0;
    } else if (cmax === r) {
      h = ((g - b) / delta) % 6;
    } else if (cmax === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);
    if (h < 0) {
      h += 360;
    }

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

    s = parseInt((s * 100).toFixed(1));
    l = parseInt((l * 100).toFixed(1));

    return { h, s, l, a };
  }

  static hslToRgb(h, s, l, a = 1) {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1/6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1/2) {
        return q;
      }
      if (t < 2/3) {
        return p + (q - p) * (2/3 - t) * 6;
      }
      return p;
    }

    let
      q = l < 0.5 ? l * (1 + s) : l + s - l * s,
      p = 2 * l - q;
      r = hue2rgb(p, q, h + (1/3));
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - (1/3));
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
      a: a
    };
  }

  static hexToHsl(hex) {
    const rgb = Color.hexToRgb(hex)
    return Color.rgbToHsl(rgb.r, rgb.g, rgb.b, rgb.a);
  }

  static hslToHex(hex) {
    const hsl = Color.hslToRgb(hex);
    return Color.rgbToHex(hsl.h, hsl.s, hsl.l, hsl.a);
  }

  //
  // Get, set properties
  //
  get r() {
    return this._r;
  }

  get g() {
    return this._g;
  }

  get b() {
    return this._b;
  }

  get h() {
    return this._h;
  }

  get s() {
    return this._s;
  }

  get l() {
    return this._l;
  }
  
  get a() {
    return this._a;
  }

  get hex() {
    return this._hex;
  }

  get rgbString() {
    if (this._a < 1) {
      return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a.toFixed(3)})`;
    } else {
      return `rgb(${this._r}, ${this._g}, ${this._b})`;
    }
  }

  get hslString() {
    if (this._a < 255) {
      return `hsla(${this._h}, ${this._s}%, ${this._l}%, ${this._a.toFixed(3)})`;
    } else {
      return `hsl(${this._h}, ${this._s}%, ${this._l}%)`;
    }
  }

  set r(v) {
    this._r = Color.normalise(v);
    this.update('rgb');
  }

  set g(v) {
    this._g = Color.normalise(v);
    this.update('rgb');
  }

  set b(v) {
    this._b = Color.normalise(v);
    this.update('rgb');
  }

  set h(v) {
    this._h = Color.normalise(v);
    this.update('hsl');
  }

  set s(v) {
    this._s = Color.normalise(v);
    this.update('hsl');
  }

  set l(v) {
    this._l = Color.normalise(v);
    this.update('hsl');
  }
  
  set a(v) {
    this._l = Color.normalise(v, true);
    this._hex = Color.rgbToHex(this._r, this._g, this._b, this._a);
  }

  set hex(v) {
    if (v[0] === '#' && [4, 5, 7, 8, 9].indexOf(v.length) > -1) {
      this._hex = Color.normalise(v);
      this.update('hex');
    } else {
      console.error('Invalid hex')
    }
  }
  
  
  //
  // Helper functions
  //
  static getAverage(colors) {
    let
      r = 0,
      g = 0,
      b = 0;
    colors.forEach(c => {
      r += c.r * c.r;
      g += c.g * c.g;
      b += c.b * c.b;
    });
    return {
      r: Math.floor(Math.sqrt(r / colors.length)),
      g: Math.floor(Math.sqrt(g / colors.length)),
      b: Math.floor(Math.sqrt(b / colors.length))
    };
  }
  
  static dataToRgba(data) {
    let rgbas = [];
    for (let i = 0; i < data.length; i += 4) {
      rgbs.push({
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3]
      })
    }
    return rgbas;
  }
  
  static rgbToData(rgbs) {
    let data = [];
    rgbs.forEach(rgb => data.push(rgb.r, rgb.g, rgb.r, rgb.a || rgb.a === 0 ? rgb.a : 1));
    return data;
  }

  //
  // Named Colors
  //
  findNearestName() {
    let near;
    Color.NAMED_COLORS.forEach((n) => {
      const dist =
        Math.pow(this.r - n.rgb[0], 2) +
        Math.pow(this.g - n.rgb[1], 2) +
        Math.pow(this.b - n.rgb[2], 2)
      if (!near || dist < near.dist) {
        near = {
          color: n,
          dist: dist
        };
      }
    });
    return {
      name: near.color.name,
      hex: '#' + near.color.hex,
      match: (195075 - near.dist) / 195075
    }
  }

  static NAMED_COLORS = [
    {
        "name": "absolute zero",
        "hex": "0048ba",
    },
    {
        "name": "acid green",
        "hex": "b0bf1a",
    },
    {
        "name": "aero",
        "hex": "7cb9e8",
    },
    {
        "name": "aero blue",
        "hex": "c9ffe5",
    },
    {
        "name": "african violet",
        "hex": "b284be",
    },
    {
        "name": "air force blue",
        "hex": "00308f",
    },
    {
        "name": "air superiority blue",
        "hex": "72a0c1",
    },
    {
        "name": "alabama crimson",
        "hex": "af002a",
    },
    {
        "name": "alabaster",
        "hex": "f2f0e6",
    },
    {
        "name": "alice blue",
        "hex": "f0f8ff",
    },
    {
        "name": "alien armpit",
        "hex": "84de02",
    },
    {
        "name": "alizarin crimson",
        "hex": "e32636",
    },
    {
        "name": "alloy orange",
        "hex": "c46210",
    },
    {
        "name": "almond",
        "hex": "efdecd",
    },
    {
        "name": "amaranth",
        "hex": "e52b50",
    },
    {
        "name": "amaranth deep purple",
        "hex": "9f2b68",
    },
    {
        "name": "amaranth pink",
        "hex": "f19cbb",
    },
    {
        "name": "amaranth purple",
        "hex": "ab274f",
    },
    {
        "name": "amaranth red",
        "hex": "d3212d",
    },
    {
        "name": "amazon",
        "hex": "3b7a57",
    },
    {
        "name": "amber",
        "hex": "ffbf00",
    },
    {
        "name": "american blue",
        "hex": "3b3b6d",
    },
    {
        "name": "american bronze",
        "hex": "391802",
    },
    {
        "name": "american brown",
        "hex": "804040",
    },
    {
        "name": "american gold",
        "hex": "d3af37",
    },
    {
        "name": "american green",
        "hex": "34b334",
    },
    {
        "name": "american orange",
        "hex": "ff8b00",
    },
    {
        "name": "american pink",
        "hex": "ff9899",
    },
    {
        "name": "american purple",
        "hex": "431c53",
    },
    {
        "name": "american red",
        "hex": "b32134",
    },
    {
        "name": "american rose",
        "hex": "ff033e",
    },
    {
        "name": "american silver",
        "hex": "cfcfcf",
    },
    {
        "name": "american violet",
        "hex": "551b8c",
    },
    {
        "name": "american yellow",
        "hex": "f2b400",
    },
    {
        "name": "amethyst",
        "hex": "9966cc",
    },
    {
        "name": "android green",
        "hex": "a4c639",
    },
    {
        "name": "animal blood",
        "hex": "a41313",
    },
    {
        "name": "anti-flash white",
        "hex": "f2f3f4",
    },
    {
        "name": "antique brass",
        "hex": "cd9575",
    },
    {
        "name": "antique bronze",
        "hex": "665d1e",
    },
    {
        "name": "antique fuchsia",
        "hex": "915c83",
    },
    {
        "name": "antique ruby",
        "hex": "841b2d",
    },
    {
        "name": "antique white",
        "hex": "faebd7",
    },
    {
        "name": "ao",
        "hex": "008000",
    },
    {
        "name": "apple",
        "hex": "66b447",
    },
    {
        "name": "apple green",
        "hex": "8db600",
    },
    {
        "name": "apricot",
        "hex": "fbceb1",
    },
    {
        "name": "aqua",
        "hex": "00ffff",
    },
    {
        "name": "aquamarine",
        "hex": "7fffd4",
    },
    {
        "name": "arctic lime",
        "hex": "d0ff14",
    },
    {
        "name": "argent",
        "hex": "c0c0c0",
    },
    {
        "name": "army green",
        "hex": "4b5320",
    },
    {
        "name": "arsenic",
        "hex": "3b444b",
    },
    {
        "name": "artichoke",
        "hex": "8f9779",
    },
    {
        "name": "arylide yellow",
        "hex": "e9d66b",
    },
    {
        "name": "ash gray",
        "hex": "b2beb5",
    },
    {
        "name": "asparagus",
        "hex": "87a96b",
    },
    {
        "name": "ateneo blue",
        "hex": "003a6c",
    },
    {
        "name": "atomic tangerine",
        "hex": "ff9966",
    },
    {
        "name": "auburn",
        "hex": "a52a2a",
    },
    {
        "name": "aureolin",
        "hex": "fdee00",
    },
    {
        "name": "aurometalsaurus",
        "hex": "6e7f80",
    },
    {
        "name": "automotive amber",
        "hex": "ff7e00",
    },
    {
        "name": "avocado",
        "hex": "568203",
    },
    {
        "name": "awesome",
        "hex": "ff2052",
    },
    {
        "name": "axolotl",
        "hex": "63775b",
    },
    {
        "name": "aztec gold",
        "hex": "c39953",
    },
    {
        "name": "azure",
        "hex": "007fff",
    },
    {
        "name": "azure mist",
        "hex": "f0ffff",
    },
    {
        "name": "azureish white",
        "hex": "dbe9f4",
    },
    {
        "name": "b'dazzled blue",
        "hex": "2e5894",
    },
    {
        "name": "baby blue",
        "hex": "89cff0",
    },
    {
        "name": "baby blue eyes",
        "hex": "a1caf1",
    },
    {
        "name": "baby pink",
        "hex": "f4c2c2",
    },
    {
        "name": "baby powder",
        "hex": "fefefa",
    },
    {
        "name": "baker-miller pink",
        "hex": "ff91af",
    },
    {
        "name": "ball blue",
        "hex": "21abcd",
    },
    {
        "name": "banana mania",
        "hex": "fae7b5",
    },
    {
        "name": "banana yellow",
        "hex": "ffe135",
    },
    {
        "name": "bangladesh green",
        "hex": "006a4e",
    },
    {
        "name": "barbie pink",
        "hex": "e0218a",
    },
    {
        "name": "barn red",
        "hex": "7c0a02",
    },
    {
        "name": "battery charged blue",
        "hex": "1dacd6",
    },
    {
        "name": "battleship grey",
        "hex": "848482",
    },
    {
        "name": "bazaar",
        "hex": "98777b",
    },
    {
        "name": "beau blue",
        "hex": "bcd4e6",
    },
    {
        "name": "beaver",
        "hex": "9f8170",
    },
    {
        "name": "beer",
        "hex": "f28e1c",
    },
    {
        "name": "begonia",
        "hex": "fa6e79",
    },
    {
        "name": "beige",
        "hex": "f5f5dc",
    },
    {
        "name": "big dip o’ruby",
        "hex": "9c2542",
    },
    {
        "name": "big foot feet",
        "hex": "e88e5a",
    },
    {
        "name": "bisque",
        "hex": "ffe4c4",
    },
    {
        "name": "bistre",
        "hex": "3d2b1f",
    },
    {
        "name": "bistre brown",
        "hex": "967117",
    },
    {
        "name": "bitter lemon",
        "hex": "cae00d",
    },
    {
        "name": "bitter lime",
        "hex": "bfff00",
    },
    {
        "name": "bittersweet",
        "hex": "fe6f5e",
    },
    {
        "name": "bittersweet shimmer",
        "hex": "bf4f51",
    },
    {
        "name": "black",
        "hex": "000000",
    },
    {
        "name": "black bean",
        "hex": "3d0c02",
    },
    {
        "name": "black chocolate",
        "hex": "1b1811",
    },
    {
        "name": "black coffee",
        "hex": "3b2f2f",
    },
    {
        "name": "black coral",
        "hex": "54626f",
    },
    {
        "name": "black leather jacket",
        "hex": "253529",
    },
    {
        "name": "black olive",
        "hex": "3b3c36",
    },
    {
        "name": "black shadows",
        "hex": "bfafb2",
    },
    {
        "name": "blackberry",
        "hex": "8f5973",
    },
    {
        "name": "blanched almond",
        "hex": "ffebcd",
    },
    {
        "name": "blast-off bronze",
        "hex": "a57164",
    },
    {
        "name": "blaze orange",
        "hex": "ff6700",
    },
    {
        "name": "bleu de france",
        "hex": "318ce7",
    },
    {
        "name": "blizzard blue",
        "hex": "ace5ee",
    },
    {
        "name": "blond",
        "hex": "faf0be",
    },
    {
        "name": "blood",
        "hex": "8a0303",
    },
    {
        "name": "blood orange",
        "hex": "d1001c",
    },
    {
        "name": "blood red",
        "hex": "660000",
    },
    {
        "name": "blue",
        "hex": "0000ff",
    },
    {
        "name": "blue bell",
        "hex": "a2a2d0",
    },
    {
        "name": "blue bolt",
        "hex": "00b9fb",
    },
    {
        "name": "blue cola",
        "hex": "0088dc",
    },
    {
        "name": "blue jeans",
        "hex": "5dadec",
    },
    {
        "name": "blue lagoon",
        "hex": "ace5ee",
    },
    {
        "name": "blue sapphire",
        "hex": "126180",
    },
    {
        "name": "blue yonder",
        "hex": "5072a7",
    },
    {
        "name": "blue-gray",
        "hex": "6699cc",
    },
    {
        "name": "blue-green",
        "hex": "0d98ba",
    },
    {
        "name": "blue-magenta violet",
        "hex": "553592",
    },
    {
        "name": "blue-violet",
        "hex": "8a2be2",
    },
    {
        "name": "blueberry",
        "hex": "4f86f7",
    },
    {
        "name": "bluebonnet",
        "hex": "1c1cf0",
    },
    {
        "name": "blush",
        "hex": "de5d83",
    },
    {
        "name": "bole",
        "hex": "79443b",
    },
    {
        "name": "bondi blue",
        "hex": "0095b6",
    },
    {
        "name": "bone",
        "hex": "e3dac9",
    },
    {
        "name": "booger buster",
        "hex": "dde26a",
    },
    {
        "name": "boston university red",
        "hex": "cc0000",
    },
    {
        "name": "bottle green",
        "hex": "006a4e",
    },
    {
        "name": "boysenberry",
        "hex": "873260",
    },
    {
        "name": "brandeis blue",
        "hex": "0070ff",
    },
    {
        "name": "brandy",
        "hex": "87413f",
    },
    {
        "name": "brass",
        "hex": "b5a642",
    },
    {
        "name": "brick red",
        "hex": "cb4154",
    },
    {
        "name": "bright cerulean",
        "hex": "1dacd6",
    },
    {
        "name": "bright gray",
        "hex": "ebecf0",
    },
    {
        "name": "bright green",
        "hex": "66ff00",
    },
    {
        "name": "bright lavender",
        "hex": "bf94e4",
    },
    {
        "name": "bright lilac",
        "hex": "d891ef",
    },
    {
        "name": "bright maroon",
        "hex": "c32148",
    },
    {
        "name": "bright navy blue",
        "hex": "1974d2",
    },
    {
        "name": "bright pink",
        "hex": "ff007f",
    },
    {
        "name": "bright turquoise",
        "hex": "08e8de",
    },
    {
        "name": "bright ube",
        "hex": "d19fe8",
    },
    {
        "name": "brilliant azure",
        "hex": "3399ff",
    },
    {
        "name": "brilliant lavender",
        "hex": "f4bbff",
    },
    {
        "name": "brilliant rose",
        "hex": "ff55a3",
    },
    {
        "name": "brink pink",
        "hex": "fb607f",
    },
    {
        "name": "british racing green",
        "hex": "004225",
    },
    {
        "name": "bronze",
        "hex": "88540b",
    },
    {
        "name": "bronze",
        "hex": "cd7f32",
    },
    {
        "name": "bronze yellow",
        "hex": "737000",
    },
    {
        "name": "brown",
        "hex": "a52a2a",
    },
    {
        "name": "brown chocolate",
        "hex": "5f1933",
    },
    {
        "name": "brown coffee",
        "hex": "4a2c2a",
    },
    {
        "name": "brown sugar",
        "hex": "af6e4d",
    },
    {
        "name": "brown yellow",
        "hex": "cc9966",
    },
    {
        "name": "brown-nose",
        "hex": "6b4423",
    },
    {
        "name": "brunswick green",
        "hex": "1b4d3e",
    },
    {
        "name": "bubble gum",
        "hex": "ffc1cc",
    },
    {
        "name": "bubbles",
        "hex": "e7feff",
    },
    {
        "name": "bud green",
        "hex": "7bb661",
    },
    {
        "name": "buff",
        "hex": "f0dc82",
    },
    {
        "name": "bulgarian rose",
        "hex": "480607",
    },
    {
        "name": "burgundy",
        "hex": "800020",
    },
    {
        "name": "burlywood",
        "hex": "deb887",
    },
    {
        "name": "burnished brown",
        "hex": "a17a74",
    },
    {
        "name": "burnt orange",
        "hex": "cc5500",
    },
    {
        "name": "burnt sienna",
        "hex": "e97451",
    },
    {
        "name": "burnt umber",
        "hex": "8a3324",
    },
    {
        "name": "button blue",
        "hex": "24a0ed",
    },
    {
        "name": "byzantine",
        "hex": "bd33a4",
    },
    {
        "name": "byzantium",
        "hex": "702963",
    },
    {
        "name": "cadet",
        "hex": "536872",
    },
    {
        "name": "cadet blue",
        "hex": "5f9ea0",
    },
    {
        "name": "cadet grey",
        "hex": "91a3b0",
    },
    {
        "name": "cadmium blue",
        "hex": "0a1195",
    },
    {
        "name": "cadmium green",
        "hex": "006b3c",
    },
    {
        "name": "cadmium orange",
        "hex": "ed872d",
    },
    {
        "name": "cadmium purple",
        "hex": "b60c26",
    },
    {
        "name": "cadmium red",
        "hex": "e30022",
    },
    {
        "name": "cadmium violet",
        "hex": "7f3e98",
    },
    {
        "name": "cadmium yellow",
        "hex": "fff600",
    },
    {
        "name": "café au lait",
        "hex": "a67b5b",
    },
    {
        "name": "café noir",
        "hex": "4b3621",
    },
    {
        "name": "cal poly pomona green",
        "hex": "1e4d2b",
    },
    {
        "name": "calamansi",
        "hex": "fcffa4",
    },
    {
        "name": "cambridge blue",
        "hex": "a3c1ad",
    },
    {
        "name": "camel",
        "hex": "c19a6b",
    },
    {
        "name": "cameo pink",
        "hex": "efbbcc",
    },
    {
        "name": "camouflage green",
        "hex": "78866b",
    },
    {
        "name": "canary",
        "hex": "ffff99",
    },
    {
        "name": "canary yellow",
        "hex": "ffef00",
    },
    {
        "name": "candy apple red",
        "hex": "ff0800",
    },
    {
        "name": "candy pink",
        "hex": "e4717a",
    },
    {
        "name": "capri",
        "hex": "00bfff",
    },
    {
        "name": "caput mortuum",
        "hex": "592720",
    },
    {
        "name": "caramel",
        "hex": "ffd59a",
    },
    {
        "name": "cardinal",
        "hex": "c41e3a",
    },
    {
        "name": "caribbean green",
        "hex": "00cc99",
    },
    {
        "name": "carmine",
        "hex": "960018",
    },
    {
        "name": "carmine pink",
        "hex": "eb4c42",
    },
    {
        "name": "carmine red",
        "hex": "ff0038",
    },
    {
        "name": "carnation pink",
        "hex": "ffa6c9",
    },
    {
        "name": "carnelian",
        "hex": "b31b1b",
    },
    {
        "name": "carolina blue",
        "hex": "56a0d3",
    },
    {
        "name": "carrot orange",
        "hex": "ed9121",
    },
    {
        "name": "castleton green",
        "hex": "00563f",
    },
    {
        "name": "catalina blue",
        "hex": "062a78",
    },
    {
        "name": "catawba",
        "hex": "703642",
    },
    {
        "name": "cedar chest",
        "hex": "c95a49",
    },
    {
        "name": "ceil",
        "hex": "92a1cf",
    },
    {
        "name": "celadon",
        "hex": "ace1af",
    },
    {
        "name": "celadon blue",
        "hex": "007ba7",
    },
    {
        "name": "celadon green",
        "hex": "2f847c",
    },
    {
        "name": "celeste",
        "hex": "b2ffff",
    },
    {
        "name": "celestial blue",
        "hex": "4997d0",
    },
    {
        "name": "celtic blue",
        "hex": "246bce",
    },
    {
        "name": "cerise",
        "hex": "de3163",
    },
    {
        "name": "cerise pink",
        "hex": "ec3b83",
    },
    {
        "name": "cerulean",
        "hex": "007ba7",
    },
    {
        "name": "cerulean blue",
        "hex": "2a52be",
    },
    {
        "name": "cerulean frost",
        "hex": "6d9bc3",
    },
    {
        "name": "cetacean blue",
        "hex": "001440",
    },
    {
        "name": "cg blue",
        "hex": "007aa5",
    },
    {
        "name": "cg red",
        "hex": "e03c31",
    },
    {
        "name": "chamoisee",
        "hex": "a0785a",
    },
    {
        "name": "champagne",
        "hex": "f7e7ce",
    },
    {
        "name": "champagne pink",
        "hex": "f1ddcf",
    },
    {
        "name": "charcoal",
        "hex": "36454f",
    },
    {
        "name": "charleston green",
        "hex": "232b2b",
    },
    {
        "name": "charm",
        "hex": "d0748b",
    },
    {
        "name": "charm pink",
        "hex": "e68fac",
    },
    {
        "name": "chartreuse",
        "hex": "7fff00",
    },
    {
        "name": "cheese",
        "hex": "ffa600",
    },
    {
        "name": "cherry",
        "hex": "de3163",
    },
    {
        "name": "cherry blossom pink",
        "hex": "ffb7c5",
    },
    {
        "name": "chestnut",
        "hex": "954535",
    },
    {
        "name": "china pink",
        "hex": "de6fa1",
    },
    {
        "name": "china rose",
        "hex": "a8516e",
    },
    {
        "name": "chinese black",
        "hex": "141414",
    },
    {
        "name": "chinese blue",
        "hex": "365194",
    },
    {
        "name": "chinese bronze",
        "hex": "cd8032",
    },
    {
        "name": "chinese brown",
        "hex": "ab381f",
    },
    {
        "name": "chinese gold",
        "hex": "cc9900",
    },
    {
        "name": "chinese green",
        "hex": "d0db61",
    },
    {
        "name": "chinese orange",
        "hex": "f37042",
    },
    {
        "name": "chinese pink",
        "hex": "de70a1",
    },
    {
        "name": "chinese purple",
        "hex": "720b98",
    },
    {
        "name": "chinese red",
        "hex": "cd071e",
    },
    {
        "name": "chinese red",
        "hex": "aa381e",
    },
    {
        "name": "chinese silver",
        "hex": "cccccc",
    },
    {
        "name": "chinese violet",
        "hex": "856088",
    },
    {
        "name": "chinese white",
        "hex": "e2e5de",
    },
    {
        "name": "chinese yellow",
        "hex": "ffb200",
    },
    {
        "name": "chlorophyll green",
        "hex": "4aff00",
    },
    {
        "name": "chocolate",
        "hex": "d2691e",
    },
    {
        "name": "chocolate brown",
        "hex": "3f000f",
    },
    {
        "name": "chocolate cosmos",
        "hex": "58111a",
    },
    {
        "name": "chocolate kisses",
        "hex": "3c1421",
    },
    {
        "name": "chrome yellow",
        "hex": "ffa700",
    },
    {
        "name": "cinereous",
        "hex": "98817b",
    },
    {
        "name": "cinnabar",
        "hex": "e34234",
    },
    {
        "name": "cinnamon",
        "hex": "d2691e",
    },
    {
        "name": "cinnamon satin",
        "hex": "cd607e",
    },
    {
        "name": "citrine",
        "hex": "e4d00a",
    },
    {
        "name": "citrine brown",
        "hex": "933709",
    },
    {
        "name": "citron",
        "hex": "9fa91f",
    },
    {
        "name": "claret",
        "hex": "7f1734",
    },
    {
        "name": "classic rose",
        "hex": "fbcce7",
    },
    {
        "name": "cobalt blue",
        "hex": "0047ab",
    },
    {
        "name": "cocoa brown",
        "hex": "d2691e",
    },
    {
        "name": "coconut",
        "hex": "965a3e",
    },
    {
        "name": "coffee",
        "hex": "6f4e37",
    },
    {
        "name": "coin bronze",
        "hex": "514100",
    },
    {
        "name": "cola",
        "hex": "3c3024",
    },
    {
        "name": "columbia blue",
        "hex": "c4d8e2",
    },
    {
        "name": "conditioner",
        "hex": "ffffcc",
    },
    {
        "name": "congo pink",
        "hex": "f88379",
    },
    {
        "name": "cookies and cream",
        "hex": "eee0b1",
    },
    {
        "name": "cool black",
        "hex": "002e63",
    },
    {
        "name": "cool grey",
        "hex": "8c92ac",
    },
    {
        "name": "copper",
        "hex": "b87333",
    },
    {
        "name": "copper penny",
        "hex": "ad6f69",
    },
    {
        "name": "copper red",
        "hex": "cb6d51",
    },
    {
        "name": "copper rose",
        "hex": "996666",
    },
    {
        "name": "coquelicot",
        "hex": "ff3800",
    },
    {
        "name": "coral",
        "hex": "ff7f50",
    },
    {
        "name": "coral pink",
        "hex": "f88379",
    },
    {
        "name": "coral red",
        "hex": "ff4040",
    },
    {
        "name": "coral reef",
        "hex": "fd7c6e",
    },
    {
        "name": "cordovan",
        "hex": "893f45",
    },
    {
        "name": "corn",
        "hex": "fbec5d",
    },
    {
        "name": "cornell red",
        "hex": "b31b1b",
    },
    {
        "name": "cornflower",
        "hex": "93ccea",
    },
    {
        "name": "cornflower blue",
        "hex": "6495ed",
    },
    {
        "name": "cornsilk",
        "hex": "fff8dc",
    },
    {
        "name": "cosmic cobalt",
        "hex": "2e2d88",
    },
    {
        "name": "cosmic latte",
        "hex": "fff8e7",
    },
    {
        "name": "cotton candy",
        "hex": "ffbcd9",
    },
    {
        "name": "coyote brown",
        "hex": "81613c",
    },
    {
        "name": "crayola blue",
        "hex": "1f75fe",
    },
    {
        "name": "crayola blue-violet",
        "hex": "7366bd",
    },
    {
        "name": "crayola bright yellow",
        "hex": "ffaa1d",
    },
    {
        "name": "crayola brown",
        "hex": "af593e",
    },
    {
        "name": "crayola cadet blue",
        "hex": "a9b2c3",
    },
    {
        "name": "crayola cerulean",
        "hex": "1dacd6",
    },
    {
        "name": "crayola copper",
        "hex": "da8a67",
    },
    {
        "name": "crayola dandelion",
        "hex": "fddb6d",
    },
    {
        "name": "crayola forest green",
        "hex": "5fa777",
    },
    {
        "name": "crayola fuchsia",
        "hex": "c154c1",
    },
    {
        "name": "crayola gold",
        "hex": "e6be8a",
    },
    {
        "name": "crayola green",
        "hex": "1cac78",
    },
    {
        "name": "crayola lemon yellow",
        "hex": "ffff9f",
    },
    {
        "name": "crayola magenta",
        "hex": "ff55a3",
    },
    {
        "name": "crayola maize",
        "hex": "f2c649",
    },
    {
        "name": "crayola maroon",
        "hex": "c32148",
    },
    {
        "name": "crayola mulberry",
        "hex": "c8509b",
    },
    {
        "name": "crayola navy blue",
        "hex": "1974d2",
    },
    {
        "name": "crayola orange",
        "hex": "ff7538",
    },
    {
        "name": "crayola orange-red",
        "hex": "ff5349",
    },
    {
        "name": "crayola orange-yellow",
        "hex": "f8d568",
    },
    {
        "name": "crayola orchid",
        "hex": "e29cd2",
    },
    {
        "name": "crayola outer space",
        "hex": "2d383a",
    },
    {
        "name": "crayola periwinkle",
        "hex": "c3cde6",
    },
    {
        "name": "crayola red",
        "hex": "ee204d",
    },
    {
        "name": "crayola red-orange",
        "hex": "ff681f",
    },
    {
        "name": "crayola red-violet",
        "hex": "c0448f",
    },
    {
        "name": "crayola sea green",
        "hex": "00ffcd",
    },
    {
        "name": "crayola shocking pink",
        "hex": "ff6fff",
    },
    {
        "name": "crayola silver",
        "hex": "c9c0bb",
    },
    {
        "name": "crayola sky blue",
        "hex": "76d7ea",
    },
    {
        "name": "crayola spring green",
        "hex": "ecebbd",
    },
    {
        "name": "crayola tan",
        "hex": "d99a6c",
    },
    {
        "name": "crayola thistle",
        "hex": "ebb0d7",
    },
    {
        "name": "crayola violet",
        "hex": "963d7f",
    },
    {
        "name": "crayola violet-blue",
        "hex": "766ec8",
    },
    {
        "name": "crayola yellow",
        "hex": "fce883",
    },
    {
        "name": "crayola yellow-green",
        "hex": "c5e384",
    },
    {
        "name": "cream",
        "hex": "fffdd0",
    },
    {
        "name": "crimson",
        "hex": "dc143c",
    },
    {
        "name": "crimson glory",
        "hex": "be0032",
    },
    {
        "name": "crimson red",
        "hex": "990000",
    },
    {
        "name": "crystal",
        "hex": "a7d8de",
    },
    {
        "name": "crystal blue",
        "hex": "68a0b0",
    },
    {
        "name": "cultured",
        "hex": "f5f5f5",
    },
    {
        "name": "cyan",
        "hex": "00ffff",
    },
    {
        "name": "cyan azure",
        "hex": "4e82b4",
    },
    {
        "name": "cyan cobalt blue",
        "hex": "28589c",
    },
    {
        "name": "cyan cornflower blue",
        "hex": "188bc2",
    },
    {
        "name": "cyan-blue azure",
        "hex": "4682bf",
    },
    {
        "name": "cyber grape",
        "hex": "58427c",
    },
    {
        "name": "cyber yellow",
        "hex": "ffd300",
    },
    {
        "name": "cyclamen",
        "hex": "f56fa1",
    },
    {
        "name": "daffodil",
        "hex": "ffff31",
    },
    {
        "name": "dandelion",
        "hex": "f0e130",
    },
    {
        "name": "dark blood",
        "hex": "630f0f",
    },
    {
        "name": "dark blue",
        "hex": "00008b",
    },
    {
        "name": "dark blue-gray",
        "hex": "666699",
    },
    {
        "name": "dark bronze",
        "hex": "804a00",
    },
    {
        "name": "dark brown",
        "hex": "654321",
    },
    {
        "name": "dark brown-tangelo",
        "hex": "88654e",
    },
    {
        "name": "dark byzantium",
        "hex": "5d3954",
    },
    {
        "name": "dark candy apple red",
        "hex": "a40000",
    },
    {
        "name": "dark cerulean",
        "hex": "08457e",
    },
    {
        "name": "dark charcoal",
        "hex": "333333",
    },
    {
        "name": "dark chestnut",
        "hex": "986960",
    },
    {
        "name": "dark chocolate",
        "hex": "490206",
    },
    {
        "name": "dark coral",
        "hex": "cd5b45",
    },
    {
        "name": "dark cornflower blue",
        "hex": "26428b",
    },
    {
        "name": "dark cyan",
        "hex": "008b8b",
    },
    {
        "name": "dark electric blue",
        "hex": "536878",
    },
    {
        "name": "dark gold",
        "hex": "aa6c39",
    },
    {
        "name": "dark goldenrod",
        "hex": "b8860b",
    },
    {
        "name": "dark gray (x11)",
        "hex": "a9a9a9",
    },
    {
        "name": "dark green",
        "hex": "013220",
    },
    {
        "name": "dark green (x11)",
        "hex": "006400",
    },
    {
        "name": "dark gunmetal",
        "hex": "1f262a",
    },
    {
        "name": "dark imperial blue",
        "hex": "00416a",
    },
    {
        "name": "dark imperial blue",
        "hex": "00147e",
    },
    {
        "name": "dark jungle green",
        "hex": "1a2421",
    },
    {
        "name": "dark khaki",
        "hex": "bdb76b",
    },
    {
        "name": "dark lava",
        "hex": "483c32",
    },
    {
        "name": "dark lavender",
        "hex": "734f96",
    },
    {
        "name": "dark lemon lime",
        "hex": "8bbe1b",
    },
    {
        "name": "dark liver",
        "hex": "534b4f",
    },
    {
        "name": "dark magenta",
        "hex": "8b008b",
    },
    {
        "name": "dark medium gray",
        "hex": "a9a9a9",
    },
    {
        "name": "dark midnight blue",
        "hex": "003366",
    },
    {
        "name": "dark moss green",
        "hex": "4a5d23",
    },
    {
        "name": "dark olive drab",
        "hex": "3c341f",
    },
    {
        "name": "dark olive green",
        "hex": "556b2f",
    },
    {
        "name": "dark orange",
        "hex": "ff8c00",
    },
    {
        "name": "dark orchid",
        "hex": "9932cc",
    },
    {
        "name": "dark pastel blue",
        "hex": "779ecb",
    },
    {
        "name": "dark pastel green",
        "hex": "03c03c",
    },
    {
        "name": "dark pastel purple",
        "hex": "966fd6",
    },
    {
        "name": "dark pastel red",
        "hex": "c23b22",
    },
    {
        "name": "dark pink",
        "hex": "e75480",
    },
    {
        "name": "dark powder blue",
        "hex": "003399",
    },
    {
        "name": "dark puce",
        "hex": "4f3a3c",
    },
    {
        "name": "dark purple",
        "hex": "301934",
    },
    {
        "name": "dark raspberry",
        "hex": "872657",
    },
    {
        "name": "dark red",
        "hex": "8b0000",
    },
    {
        "name": "dark salmon",
        "hex": "e9967a",
    },
    {
        "name": "dark scarlet",
        "hex": "560319",
    },
    {
        "name": "dark sea green",
        "hex": "8fbc8f",
    },
    {
        "name": "dark sienna",
        "hex": "3c1414",
    },
    {
        "name": "dark silver",
        "hex": "71706e",
    },
    {
        "name": "dark sky blue",
        "hex": "8cbed6",
    },
    {
        "name": "dark slate blue",
        "hex": "483d8b",
    },
    {
        "name": "dark slate gray",
        "hex": "2f4f4f",
    },
    {
        "name": "dark spring green",
        "hex": "177245",
    },
    {
        "name": "dark tan",
        "hex": "918151",
    },
    {
        "name": "dark tangerine",
        "hex": "ffa812",
    },
    {
        "name": "dark taupe",
        "hex": "483c32",
    },
    {
        "name": "dark terra cotta",
        "hex": "cc4e5c",
    },
    {
        "name": "dark turquoise",
        "hex": "00ced1",
    },
    {
        "name": "dark vanilla",
        "hex": "d1bea8",
    },
    {
        "name": "dark violet",
        "hex": "9400d3",
    },
    {
        "name": "dark yellow",
        "hex": "9b870c",
    },
    {
        "name": "dartmouth green",
        "hex": "00703c",
    },
    {
        "name": "davy's grey",
        "hex": "555555",
    },
    {
        "name": "debian red",
        "hex": "d70a53",
    },
    {
        "name": "deep amethyst",
        "hex": "9c8aa4",
    },
    {
        "name": "deep aquamarine",
        "hex": "40826d",
    },
    {
        "name": "deep carmine",
        "hex": "a9203e",
    },
    {
        "name": "deep carmine pink",
        "hex": "ef3038",
    },
    {
        "name": "deep carrot orange",
        "hex": "e9692c",
    },
    {
        "name": "deep cerise",
        "hex": "da3287",
    },
    {
        "name": "deep champagne",
        "hex": "fad6a5",
    },
    {
        "name": "deep chestnut",
        "hex": "b94e48",
    },
    {
        "name": "deep coffee",
        "hex": "704241",
    },
    {
        "name": "deep dumpling",
        "hex": "9b351b",
    },
    {
        "name": "deep fuchsia",
        "hex": "c154c1",
    },
    {
        "name": "deep green",
        "hex": "056608",
    },
    {
        "name": "deep green-cyan turquoise",
        "hex": "0e7c61",
    },
    {
        "name": "deep jungle green",
        "hex": "004b49",
    },
    {
        "name": "deep koamaru",
        "hex": "333366",
    },
    {
        "name": "deep lemon",
        "hex": "f5c71a",
    },
    {
        "name": "deep lilac",
        "hex": "9955bb",
    },
    {
        "name": "deep magenta",
        "hex": "cc00cc",
    },
    {
        "name": "deep maroon",
        "hex": "820000",
    },
    {
        "name": "deep mauve",
        "hex": "d473d4",
    },
    {
        "name": "deep moss green",
        "hex": "355e3b",
    },
    {
        "name": "deep peach",
        "hex": "ffcba4",
    },
    {
        "name": "deep pink",
        "hex": "ff1493",
    },
    {
        "name": "deep puce",
        "hex": "a95c68",
    },
    {
        "name": "deep red",
        "hex": "850101",
    },
    {
        "name": "deep ruby",
        "hex": "843f5b",
    },
    {
        "name": "deep saffron",
        "hex": "ff9933",
    },
    {
        "name": "deep sky blue",
        "hex": "00bfff",
    },
    {
        "name": "deep space sparkle",
        "hex": "4a646c",
    },
    {
        "name": "deep spring bud",
        "hex": "556b2f",
    },
    {
        "name": "deep taupe",
        "hex": "7e5e60",
    },
    {
        "name": "deep tuscan red",
        "hex": "66424d",
    },
    {
        "name": "deep violet",
        "hex": "330066",
    },
    {
        "name": "deer",
        "hex": "ba8759",
    },
    {
        "name": "denim",
        "hex": "1560bd",
    },
    {
        "name": "denim blue",
        "hex": "2243b6",
    },
    {
        "name": "desaturated cyan",
        "hex": "669999",
    },
    {
        "name": "desert",
        "hex": "c19a6b",
    },
    {
        "name": "desert sand",
        "hex": "edc9af",
    },
    {
        "name": "desire",
        "hex": "ea3c53",
    },
    {
        "name": "diamond",
        "hex": "b9f2ff",
    },
    {
        "name": "dim gray",
        "hex": "696969",
    },
    {
        "name": "dingy dungeon",
        "hex": "c53151",
    },
    {
        "name": "dirt",
        "hex": "9b7653",
    },
    {
        "name": "dirty brown",
        "hex": "b5651e",
    },
    {
        "name": "dirty white",
        "hex": "e8e4c9",
    },
    {
        "name": "dodger blue",
        "hex": "1e90ff",
    },
    {
        "name": "dodie yellow",
        "hex": "fef65b",
    },
    {
        "name": "dogs liver",
        "hex": "b86d29",
    },
    {
        "name": "dogwood rose",
        "hex": "d71868",
    },
    {
        "name": "dollar bill",
        "hex": "85bb65",
    },
    {
        "name": "dolphin gray",
        "hex": "828e84",
    },
    {
        "name": "drab",
        "hex": "967117",
    },
    {
        "name": "duke blue",
        "hex": "00009c",
    },
    {
        "name": "dust storm",
        "hex": "e5ccc9",
    },
    {
        "name": "dutch white",
        "hex": "efdfbb",
    },
    {
        "name": "earth yellow",
        "hex": "e1a95f",
    },
    {
        "name": "ebony",
        "hex": "555d50",
    },
    {
        "name": "ecru",
        "hex": "c2b280",
    },
    {
        "name": "eerie black",
        "hex": "1b1b1b",
    },
    {
        "name": "eggplant",
        "hex": "614051",
    },
    {
        "name": "eggshell",
        "hex": "f0ead6",
    },
    {
        "name": "egyptian blue",
        "hex": "1034a6",
    },
    {
        "name": "electric blue",
        "hex": "7df9ff",
    },
    {
        "name": "electric brown",
        "hex": "b56257",
    },
    {
        "name": "electric crimson",
        "hex": "ff003f",
    },
    {
        "name": "electric cyan",
        "hex": "00ffff",
    },
    {
        "name": "electric green",
        "hex": "00ff00",
    },
    {
        "name": "electric indigo",
        "hex": "6f00ff",
    },
    {
        "name": "electric lavender",
        "hex": "f4bbff",
    },
    {
        "name": "electric lime",
        "hex": "ccff00",
    },
    {
        "name": "electric orange",
        "hex": "ff3503",
    },
    {
        "name": "electric pink",
        "hex": "f62681",
    },
    {
        "name": "electric purple",
        "hex": "bf00ff",
    },
    {
        "name": "electric red",
        "hex": "e60000",
    },
    {
        "name": "electric ultramarine",
        "hex": "3f00ff",
    },
    {
        "name": "electric violet",
        "hex": "8f00ff",
    },
    {
        "name": "electric yellow",
        "hex": "ffff33",
    },
    {
        "name": "emerald",
        "hex": "50c878",
    },
    {
        "name": "emerald green",
        "hex": "046307",
    },
    {
        "name": "eminence",
        "hex": "6c3082",
    },
    {
        "name": "english green",
        "hex": "1b4d3e",
    },
    {
        "name": "english lavender",
        "hex": "b48395",
    },
    {
        "name": "english red",
        "hex": "ab4b52",
    },
    {
        "name": "english vermillion",
        "hex": "cc474b",
    },
    {
        "name": "english violet",
        "hex": "563c5c",
    },
    {
        "name": "eton blue",
        "hex": "96c8a2",
    },
    {
        "name": "eucalyptus",
        "hex": "44d7a8",
    },
    {
        "name": "fallow",
        "hex": "c19a6b",
    },
    {
        "name": "falu red",
        "hex": "801818",
    },
    {
        "name": "fandango",
        "hex": "b53389",
    },
    {
        "name": "fandango pink",
        "hex": "de5285",
    },
    {
        "name": "fashion fuchsia",
        "hex": "f400a1",
    },
    {
        "name": "fawn",
        "hex": "e5aa70",
    },
    {
        "name": "feldgrau",
        "hex": "4d5d53",
    },
    {
        "name": "feldspar",
        "hex": "fdd5b1",
    },
    {
        "name": "fern green",
        "hex": "4f7942",
    },
    {
        "name": "ferrari red",
        "hex": "ff2800",
    },
    {
        "name": "field drab",
        "hex": "6c541e",
    },
    {
        "name": "fiery rose",
        "hex": "ff5470",
    },
    {
        "name": "fire engine red",
        "hex": "ce2029",
    },
    {
        "name": "fire opal",
        "hex": "e95c4b",
    },
    {
        "name": "firebrick",
        "hex": "b22222",
    },
    {
        "name": "flame",
        "hex": "e25822",
    },
    {
        "name": "flamingo pink",
        "hex": "fc8eac",
    },
    {
        "name": "flattery",
        "hex": "6b4423",
    },
    {
        "name": "flavescent",
        "hex": "f7e98e",
    },
    {
        "name": "flax",
        "hex": "eedc82",
    },
    {
        "name": "flesh",
        "hex": "ffe9d1",
    },
    {
        "name": "flirt",
        "hex": "a2006d",
    },
    {
        "name": "floral lavender",
        "hex": "b57edc",
    },
    {
        "name": "floral white",
        "hex": "fffaf0",
    },
    {
        "name": "fluorescent blue",
        "hex": "15f4ee",
    },
    {
        "name": "fluorescent orange",
        "hex": "ffbf00",
    },
    {
        "name": "fluorescent pink",
        "hex": "ff1493",
    },
    {
        "name": "fluorescent yellow",
        "hex": "ccff00",
    },
    {
        "name": "fogra black",
        "hex": "010b13",
    },
    {
        "name": "folly",
        "hex": "ff004f",
    },
    {
        "name": "forest green",
        "hex": "228b22",
    },
    {
        "name": "french beige",
        "hex": "a67b5b",
    },
    {
        "name": "french bistre",
        "hex": "856d4d",
    },
    {
        "name": "french blue",
        "hex": "0072bb",
    },
    {
        "name": "french fuchsia",
        "hex": "fd3f92",
    },
    {
        "name": "french lilac",
        "hex": "86608e",
    },
    {
        "name": "french lime",
        "hex": "9efd38",
    },
    {
        "name": "french mauve",
        "hex": "d473d4",
    },
    {
        "name": "french pink",
        "hex": "fd6c9e",
    },
    {
        "name": "french plum",
        "hex": "811453",
    },
    {
        "name": "french puce",
        "hex": "4e1609",
    },
    {
        "name": "french raspberry",
        "hex": "c72c48",
    },
    {
        "name": "french rose",
        "hex": "f64a8a",
    },
    {
        "name": "french sky blue",
        "hex": "77b5fe",
    },
    {
        "name": "french violet",
        "hex": "8806ce",
    },
    {
        "name": "french wine",
        "hex": "ac1e44",
    },
    {
        "name": "fresh air",
        "hex": "a6e7ff",
    },
    {
        "name": "frostbite",
        "hex": "e936a7",
    },
    {
        "name": "fuchsia",
        "hex": "ff00ff",
    },
    {
        "name": "fuchsia pink",
        "hex": "ff77ff",
    },
    {
        "name": "fuchsia purple",
        "hex": "cc397b",
    },
    {
        "name": "fuchsia rose",
        "hex": "c74375",
    },
    {
        "name": "fulvous",
        "hex": "e48400",
    },
    {
        "name": "fuzzy wuzzy",
        "hex": "cc6666",
    },
    {
        "name": "gainsboro",
        "hex": "dcdcdc",
    },
    {
        "name": "gamboge",
        "hex": "e49b0f",
    },
    {
        "name": "gamboge orange",
        "hex": "996600",
    },
    {
        "name": "gargoyle gas",
        "hex": "ffdf46",
    },
    {
        "name": "garnet",
        "hex": "733635",
    },
    {
        "name": "generic viridian",
        "hex": "007f66",
    },
    {
        "name": "ghost white",
        "hex": "f8f8ff",
    },
    {
        "name": "giant's club",
        "hex": "b05c52",
    },
    {
        "name": "giants orange",
        "hex": "fe5a1d",
    },
    {
        "name": "glaucous",
        "hex": "6082b6",
    },
    {
        "name": "glossy grape",
        "hex": "ab92b3",
    },
    {
        "name": "go green",
        "hex": "00ab66",
    },
    {
        "name": "gold",
        "hex": "ffd700",
    },
    {
        "name": "gold foil",
        "hex": "bd9b16",
    },
    {
        "name": "gold fusion",
        "hex": "85754e",
    },
    {
        "name": "golden brown",
        "hex": "996515",
    },
    {
        "name": "golden gate bridge international orange",
        "hex": "c0362c",
    },
    {
        "name": "golden poppy",
        "hex": "fcc200",
    },
    {
        "name": "golden yellow",
        "hex": "ffdf00",
    },
    {
        "name": "goldenrod",
        "hex": "daa520",
    },
    {
        "name": "granite gray",
        "hex": "676767",
    },
    {
        "name": "granny smith apple",
        "hex": "a8e4a0",
    },
    {
        "name": "grape",
        "hex": "6f2da8",
    },
    {
        "name": "gray",
        "hex": "808080",
    },
    {
        "name": "gray (x11 gray)",
        "hex": "bebebe",
    },
    {
        "name": "gray-asparagus",
        "hex": "465945",
    },
    {
        "name": "gray-blue",
        "hex": "8c92ac",
    },
    {
        "name": "green",
        "hex": "008000",
    },
    {
        "name": "green lizard",
        "hex": "a7f432",
    },
    {
        "name": "green sheen",
        "hex": "6eaea1",
    },
    {
        "name": "green-blue",
        "hex": "1164b4",
    },
    {
        "name": "green-cyan",
        "hex": "009966",
    },
    {
        "name": "green-yellow",
        "hex": "adff2f",
    },
    {
        "name": "grullo",
        "hex": "a99a86",
    },
    {
        "name": "gunmetal",
        "hex": "2a3439",
    },
    {
        "name": "guppie green",
        "hex": "00ff7f",
    },
    {
        "name": "halayà úbe",
        "hex": "663854",
    },
    {
        "name": "halloween orange",
        "hex": "eb6123",
    },
    {
        "name": "han blue",
        "hex": "446ccf",
    },
    {
        "name": "han purple",
        "hex": "5218fa",
    },
    {
        "name": "hansa yellow",
        "hex": "e9d66b",
    },
    {
        "name": "harlequin",
        "hex": "3fff00",
    },
    {
        "name": "harlequin green",
        "hex": "46cb18",
    },
    {
        "name": "harvard crimson",
        "hex": "c90016",
    },
    {
        "name": "harvest gold",
        "hex": "da9100",
    },
    {
        "name": "heart gold",
        "hex": "808000",
    },
    {
        "name": "heat wave",
        "hex": "ff7a00",
    },
    {
        "name": "heidelberg red",
        "hex": "960018",
    },
    {
        "name": "heliotrope",
        "hex": "df73ff",
    },
    {
        "name": "heliotrope gray",
        "hex": "aa98a9",
    },
    {
        "name": "heliotrope magenta",
        "hex": "aa00bb",
    },
    {
        "name": "hershey chocolate",
        "hex": "3c1321",
    },
    {
        "name": "hollywood cerise",
        "hex": "f400a1",
    },
    {
        "name": "honeydew",
        "hex": "f0fff0",
    },
    {
        "name": "honolulu blue",
        "hex": "006db0",
    },
    {
        "name": "hooker's green",
        "hex": "49796b",
    },
    {
        "name": "horses liver",
        "hex": "543d37",
    },
    {
        "name": "hot magenta",
        "hex": "ff1dce",
    },
    {
        "name": "hot pink",
        "hex": "ff69b4",
    },
    {
        "name": "hunter green",
        "hex": "355e3b",
    },
    {
        "name": "iceberg",
        "hex": "71a6d2",
    },
    {
        "name": "icterine",
        "hex": "fcf75e",
    },
    {
        "name": "iguana green",
        "hex": "71bc78",
    },
    {
        "name": "illuminating emerald",
        "hex": "319177",
    },
    {
        "name": "imperial",
        "hex": "602f6b",
    },
    {
        "name": "imperial blue",
        "hex": "002395",
    },
    {
        "name": "imperial purple",
        "hex": "66023c",
    },
    {
        "name": "imperial red",
        "hex": "ed2939",
    },
    {
        "name": "inchworm",
        "hex": "b2ec5d",
    },
    {
        "name": "independence",
        "hex": "4c516d",
    },
    {
        "name": "india green",
        "hex": "138808",
    },
    {
        "name": "indian red",
        "hex": "cd5c5c",
    },
    {
        "name": "indian yellow",
        "hex": "e3a857",
    },
    {
        "name": "indigo",
        "hex": "4b0082",
    },
    {
        "name": "indigo dye",
        "hex": "091f92",
    },
    {
        "name": "infra red",
        "hex": "ff496c",
    },
    {
        "name": "interdimensional blue",
        "hex": "360ccc",
    },
    {
        "name": "international aerospace orange",
        "hex": "ff4f00",
    },
    {
        "name": "international engineering orange",
        "hex": "ba160c",
    },
    {
        "name": "international klein blue",
        "hex": "002fa7",
    },
    {
        "name": "iris",
        "hex": "5a4fcf",
    },
    {
        "name": "irresistible",
        "hex": "b3446c",
    },
    {
        "name": "isabelline",
        "hex": "f4f0ec",
    },
    {
        "name": "islamic green",
        "hex": "009000",
    },
    {
        "name": "italian sky blue",
        "hex": "b2ffff",
    },
    {
        "name": "ivory",
        "hex": "fffff0",
    },
    {
        "name": "jacarta",
        "hex": "3d325d",
    },
    {
        "name": "jacko bean",
        "hex": "413628",
    },
    {
        "name": "jade",
        "hex": "00a86b",
    },
    {
        "name": "japanese carmine",
        "hex": "9d2933",
    },
    {
        "name": "japanese indigo",
        "hex": "264348",
    },
    {
        "name": "japanese laurel",
        "hex": "2f7532",
    },
    {
        "name": "japanese violet",
        "hex": "5b3256",
    },
    {
        "name": "jasmine",
        "hex": "f8de7e",
    },
    {
        "name": "jasper",
        "hex": "d73b3e",
    },
    {
        "name": "jasper orange",
        "hex": "de8f4e",
    },
    {
        "name": "jazzberry jam",
        "hex": "a50b5e",
    },
    {
        "name": "jelly bean",
        "hex": "da614e",
    },
    {
        "name": "jelly bean blue",
        "hex": "44798e",
    },
    {
        "name": "jet",
        "hex": "343434",
    },
    {
        "name": "jet stream",
        "hex": "bbd0c9",
    },
    {
        "name": "jonquil",
        "hex": "f4ca16",
    },
    {
        "name": "jordy blue",
        "hex": "8ab9f1",
    },
    {
        "name": "june bud",
        "hex": "bdda57",
    },
    {
        "name": "jungle green",
        "hex": "29ab87",
    },
    {
        "name": "kelly green",
        "hex": "4cbb17",
    },
    {
        "name": "kenyan copper",
        "hex": "7c1c05",
    },
    {
        "name": "keppel",
        "hex": "3ab09e",
    },
    {
        "name": "key lime",
        "hex": "e8f48c",
    },
    {
        "name": "khaki",
        "hex": "c3b091",
    },
    {
        "name": "kiwi",
        "hex": "8ee53f",
    },
    {
        "name": "kobe",
        "hex": "882d17",
    },
    {
        "name": "kobi",
        "hex": "e79fc4",
    },
    {
        "name": "kobicha",
        "hex": "6b4423",
    },
    {
        "name": "kombu green",
        "hex": "354230",
    },
    {
        "name": "ksu purple",
        "hex": "512888",
    },
    {
        "name": "ku crimson",
        "hex": "e8000d",
    },
    {
        "name": "la salle green",
        "hex": "087830",
    },
    {
        "name": "languid lavender",
        "hex": "d6cadd",
    },
    {
        "name": "lapis lazuli",
        "hex": "26619c",
    },
    {
        "name": "laser lemon",
        "hex": "ffff66",
    },
    {
        "name": "laurel green",
        "hex": "a9ba9d",
    },
    {
        "name": "lava",
        "hex": "cf1020",
    },
    {
        "name": "lavender",
        "hex": "e6e6fa",
    },
    {
        "name": "lavender blue",
        "hex": "ccccff",
    },
    {
        "name": "lavender blush",
        "hex": "fff0f5",
    },
    {
        "name": "lavender gray",
        "hex": "c4c3d0",
    },
    {
        "name": "lavender indigo",
        "hex": "9457eb",
    },
    {
        "name": "lavender magenta",
        "hex": "ee82ee",
    },
    {
        "name": "lavender mist",
        "hex": "e6e6fa",
    },
    {
        "name": "lavender pink",
        "hex": "fbaed2",
    },
    {
        "name": "lavender purple",
        "hex": "967bb6",
    },
    {
        "name": "lavender rose",
        "hex": "fba0e3",
    },
    {
        "name": "lawn green",
        "hex": "7cfc00",
    },
    {
        "name": "lemon",
        "hex": "fff700",
    },
    {
        "name": "lemon chiffon",
        "hex": "fffacd",
    },
    {
        "name": "lemon curry",
        "hex": "cca01d",
    },
    {
        "name": "lemon glacier",
        "hex": "fdff00",
    },
    {
        "name": "lemon meringue",
        "hex": "f6eabe",
    },
    {
        "name": "lemon yellow",
        "hex": "fff44f",
    },
    {
        "name": "lenurple",
        "hex": "ba93d8",
    },
    {
        "name": "liberty",
        "hex": "545aa7",
    },
    {
        "name": "licorice",
        "hex": "1a1110",
    },
    {
        "name": "light apricot",
        "hex": "fdd5b1",
    },
    {
        "name": "light blue",
        "hex": "add8e6",
    },
    {
        "name": "light brown",
        "hex": "b5651d",
    },
    {
        "name": "light carmine pink",
        "hex": "e66771",
    },
    {
        "name": "light cobalt blue",
        "hex": "88ace0",
    },
    {
        "name": "light coral",
        "hex": "f08080",
    },
    {
        "name": "light cornflower blue",
        "hex": "93ccea",
    },
    {
        "name": "light crimson",
        "hex": "f56991",
    },
    {
        "name": "light cyan",
        "hex": "e0ffff",
    },
    {
        "name": "light deep pink",
        "hex": "ff5ccd",
    },
    {
        "name": "light french beige",
        "hex": "c8ad7f",
    },
    {
        "name": "light fuchsia pink",
        "hex": "f984ef",
    },
    {
        "name": "light gold",
        "hex": "b29700",
    },
    {
        "name": "light goldenrod yellow",
        "hex": "fafad2",
    },
    {
        "name": "light gray",
        "hex": "d3d3d3",
    },
    {
        "name": "light grayish magenta",
        "hex": "cc99cc",
    },
    {
        "name": "light green",
        "hex": "90ee90",
    },
    {
        "name": "light hot pink",
        "hex": "ffb3de",
    },
    {
        "name": "light khaki",
        "hex": "f0e68c",
    },
    {
        "name": "light medium orchid",
        "hex": "d39bcb",
    },
    {
        "name": "light moss green",
        "hex": "addfad",
    },
    {
        "name": "light orange",
        "hex": "fed8b1",
    },
    {
        "name": "light orchid",
        "hex": "e6a8d7",
    },
    {
        "name": "light pastel purple",
        "hex": "b19cd9",
    },
    {
        "name": "light periwinkle",
        "hex": "c5cbe1",
    },
    {
        "name": "light pink",
        "hex": "ffb6c1",
    },
    {
        "name": "light red",
        "hex": "ffcccb",
    },
    {
        "name": "light red ochre",
        "hex": "e97451",
    },
    {
        "name": "light salmon",
        "hex": "ffa07a",
    },
    {
        "name": "light salmon pink",
        "hex": "ff9999",
    },
    {
        "name": "light sea green",
        "hex": "20b2aa",
    },
    {
        "name": "light silver",
        "hex": "d8d8d8",
    },
    {
        "name": "light sky blue",
        "hex": "87cefa",
    },
    {
        "name": "light slate gray",
        "hex": "778899",
    },
    {
        "name": "light steel blue",
        "hex": "b0c4de",
    },
    {
        "name": "light taupe",
        "hex": "b38b6d",
    },
    {
        "name": "light thulian pink",
        "hex": "e68fac",
    },
    {
        "name": "light yellow",
        "hex": "ffffe0",
    },
    {
        "name": "lilac",
        "hex": "c8a2c8",
    },
    {
        "name": "lilac luster",
        "hex": "ae98aa",
    },
    {
        "name": "lime",
        "hex": "00ff00",
    },
    {
        "name": "lime green",
        "hex": "32cd32",
    },
    {
        "name": "limerick",
        "hex": "9dc209",
    },
    {
        "name": "lincoln green",
        "hex": "195905",
    },
    {
        "name": "linen",
        "hex": "faf0e6",
    },
    {
        "name": "lion",
        "hex": "c19a6b",
    },
    {
        "name": "liseran purple",
        "hex": "de6fa1",
    },
    {
        "name": "little boy blue",
        "hex": "6ca0dc",
    },
    {
        "name": "little girl pink",
        "hex": "f8b9d4",
    },
    {
        "name": "liver",
        "hex": "674c47",
    },
    {
        "name": "liver chestnut",
        "hex": "987456",
    },
    {
        "name": "livid",
        "hex": "6699cc",
    },
    {
        "name": "lotion",
        "hex": "fefdfa",
    },
    {
        "name": "lumber",
        "hex": "ffe4cd",
    },
    {
        "name": "lust",
        "hex": "e62020",
    },
    {
        "name": "maastricht blue",
        "hex": "001c3d",
    },
    {
        "name": "macaroni and cheese",
        "hex": "ffbd88",
    },
    {
        "name": "madder lake",
        "hex": "cc3336",
    },
    {
        "name": "magenta",
        "hex": "ff00ff",
    },
    {
        "name": "magenta dye",
        "hex": "ca1f7b",
    },
    {
        "name": "magenta haze",
        "hex": "9f4576",
    },
    {
        "name": "magenta-pink",
        "hex": "cc338b",
    },
    {
        "name": "magic mint",
        "hex": "aaf0d1",
    },
    {
        "name": "magic potion",
        "hex": "ff4466",
    },
    {
        "name": "magnolia",
        "hex": "f8f4ff",
    },
    {
        "name": "mahogany",
        "hex": "c04000",
    },
    {
        "name": "maize",
        "hex": "fbec5d",
    },
    {
        "name": "majorelle blue",
        "hex": "6050dc",
    },
    {
        "name": "malachite",
        "hex": "0bda51",
    },
    {
        "name": "manatee",
        "hex": "979aaa",
    },
    {
        "name": "mandarin",
        "hex": "f37a48",
    },
    {
        "name": "mango green",
        "hex": "96ff00",
    },
    {
        "name": "mango tango",
        "hex": "ff8243",
    },
    {
        "name": "mantis",
        "hex": "74c365",
    },
    {
        "name": "mardi gras",
        "hex": "880085",
    },
    {
        "name": "marigold",
        "hex": "eaa221",
    },
    {
        "name": "maroon",
        "hex": "800000",
    },
    {
        "name": "maroon (x11)",
        "hex": "b03060",
    },
    {
        "name": "mauve",
        "hex": "e0b0ff",
    },
    {
        "name": "mauve taupe",
        "hex": "915f6d",
    },
    {
        "name": "mauvelous",
        "hex": "ef98aa",
    },
    {
        "name": "maximum blue",
        "hex": "47abcc",
    },
    {
        "name": "maximum blue green",
        "hex": "30bfbf",
    },
    {
        "name": "maximum blue purple",
        "hex": "acace6",
    },
    {
        "name": "maximum green",
        "hex": "5e8c31",
    },
    {
        "name": "maximum green yellow",
        "hex": "d9e650",
    },
    {
        "name": "maximum purple",
        "hex": "733380",
    },
    {
        "name": "maximum red",
        "hex": "d92121",
    },
    {
        "name": "maximum red purple",
        "hex": "a63a79",
    },
    {
        "name": "maximum yellow",
        "hex": "fafa37",
    },
    {
        "name": "maximum yellow red",
        "hex": "f2ba49",
    },
    {
        "name": "may green",
        "hex": "4c9141",
    },
    {
        "name": "maya blue",
        "hex": "73c2fb",
    },
    {
        "name": "meat brown",
        "hex": "e5b73b",
    },
    {
        "name": "medium aquamarine",
        "hex": "66ddaa",
    },
    {
        "name": "medium blue",
        "hex": "0000cd",
    },
    {
        "name": "medium candy apple red",
        "hex": "e2062c",
    },
    {
        "name": "medium carmine",
        "hex": "af4035",
    },
    {
        "name": "medium champagne",
        "hex": "f3e5ab",
    },
    {
        "name": "medium electric blue",
        "hex": "035096",
    },
    {
        "name": "medium jungle green",
        "hex": "1c352d",
    },
    {
        "name": "medium lavender magenta",
        "hex": "dda0dd",
    },
    {
        "name": "medium orchid",
        "hex": "ba55d3",
    },
    {
        "name": "medium persian blue",
        "hex": "0067a5",
    },
    {
        "name": "medium purple",
        "hex": "9370db",
    },
    {
        "name": "medium red-violet",
        "hex": "bb3385",
    },
    {
        "name": "medium ruby",
        "hex": "aa4069",
    },
    {
        "name": "medium sea green",
        "hex": "3cb371",
    },
    {
        "name": "medium sky blue",
        "hex": "80daeb",
    },
    {
        "name": "medium slate blue",
        "hex": "7b68ee",
    },
    {
        "name": "medium spring bud",
        "hex": "c9dc87",
    },
    {
        "name": "medium spring green",
        "hex": "00fa9a",
    },
    {
        "name": "medium taupe",
        "hex": "674c47",
    },
    {
        "name": "medium turquoise",
        "hex": "48d1cc",
    },
    {
        "name": "medium tuscan red",
        "hex": "79443b",
    },
    {
        "name": "medium vermilion",
        "hex": "d9603b",
    },
    {
        "name": "medium violet-red",
        "hex": "c71585",
    },
    {
        "name": "mellow apricot",
        "hex": "f8b878",
    },
    {
        "name": "mellow yellow",
        "hex": "f8de7e",
    },
    {
        "name": "melon",
        "hex": "fdbcb4",
    },
    {
        "name": "menthol",
        "hex": "c1f9a2",
    },
    {
        "name": "metallic blue",
        "hex": "32527b",
    },
    {
        "name": "metallic bronze",
        "hex": "b08d57",
    },
    {
        "name": "metallic bronze",
        "hex": "a97142",
    },
    {
        "name": "metallic brown",
        "hex": "ac4313",
    },
    {
        "name": "metallic gold",
        "hex": "d4af37",
    },
    {
        "name": "metallic gold",
        "hex": "a97142",
    },
    {
        "name": "metallic green",
        "hex": "296e01",
    },
    {
        "name": "metallic orange",
        "hex": "da680f",
    },
    {
        "name": "metallic pink",
        "hex": "eda6c4",
    },
    {
        "name": "metallic red",
        "hex": "a62c2b",
    },
    {
        "name": "metallic seaweed",
        "hex": "0a7e8c",
    },
    {
        "name": "metallic silver",
        "hex": "a8a9ad",
    },
    {
        "name": "metallic silver",
        "hex": "aaa9ad",
    },
    {
        "name": "metallic sunburst",
        "hex": "9c7c38",
    },
    {
        "name": "metallic violet",
        "hex": "5b0a91",
    },
    {
        "name": "metallic yellow",
        "hex": "fdcc0d",
    },
    {
        "name": "mexican pink",
        "hex": "e4007c",
    },
    {
        "name": "middle blue",
        "hex": "7ed4e6",
    },
    {
        "name": "middle blue green",
        "hex": "8dd9cc",
    },
    {
        "name": "middle blue purple",
        "hex": "8b72be",
    },
    {
        "name": "middle green",
        "hex": "4d8c57",
    },
    {
        "name": "middle green yellow",
        "hex": "acbf60",
    },
    {
        "name": "middle grey",
        "hex": "8b8680",
    },
    {
        "name": "middle purple",
        "hex": "d982b5",
    },
    {
        "name": "middle red",
        "hex": "e58e73",
    },
    {
        "name": "middle red purple",
        "hex": "a55353",
    },
    {
        "name": "middle yellow",
        "hex": "ffeb00",
    },
    {
        "name": "middle yellow red",
        "hex": "ecb176",
    },
    {
        "name": "midnight",
        "hex": "702670",
    },
    {
        "name": "midnight blue",
        "hex": "191970",
    },
    {
        "name": "midnight blue",
        "hex": "00468c",
    },
    {
        "name": "midnight green, eagle green",
        "hex": "004953",
    },
    {
        "name": "mikado yellow",
        "hex": "ffc40c",
    },
    {
        "name": "milk",
        "hex": "fdfff5",
    },
    {
        "name": "milk chocolate",
        "hex": "84563c",
    },
    {
        "name": "mimi pink",
        "hex": "ffdae9",
    },
    {
        "name": "mindaro",
        "hex": "e3f988",
    },
    {
        "name": "ming",
        "hex": "36747d",
    },
    {
        "name": "minion yellow",
        "hex": "f5e050",
    },
    {
        "name": "mint",
        "hex": "3eb489",
    },
    {
        "name": "mint cream",
        "hex": "f5fffa",
    },
    {
        "name": "mint green",
        "hex": "98ff98",
    },
    {
        "name": "misty moss",
        "hex": "bbb477",
    },
    {
        "name": "misty rose",
        "hex": "ffe4e1",
    },
    {
        "name": "moccasin",
        "hex": "faebd7",
    },
    {
        "name": "mode beige",
        "hex": "967117",
    },
    {
        "name": "moonstone",
        "hex": "3aa8c1",
    },
    {
        "name": "moonstone blue",
        "hex": "73a9c2",
    },
    {
        "name": "mordant red 19",
        "hex": "ae0c00",
    },
    {
        "name": "morning blue",
        "hex": "8da399",
    },
    {
        "name": "moss green",
        "hex": "8a9a5b",
    },
    {
        "name": "mountain meadow",
        "hex": "30ba8f",
    },
    {
        "name": "mountbatten pink",
        "hex": "997a8d",
    },
    {
        "name": "msu green",
        "hex": "18453b",
    },
    {
        "name": "mud",
        "hex": "70543e",
    },
    {
        "name": "mughal green",
        "hex": "306030",
    },
    {
        "name": "mulberry",
        "hex": "c54b8c",
    },
    {
        "name": "mummy's tomb",
        "hex": "828e84",
    },
    {
        "name": "munsell blue",
        "hex": "0093af",
    },
    {
        "name": "munsell green",
        "hex": "00a877",
    },
    {
        "name": "munsell purple",
        "hex": "9f00c5",
    },
    {
        "name": "munsell red",
        "hex": "f2003c",
    },
    {
        "name": "munsell yellow",
        "hex": "efcc00",
    },
    {
        "name": "mustard",
        "hex": "ffdb58",
    },
    {
        "name": "mustard brown",
        "hex": "cd7a00",
    },
    {
        "name": "mustard green",
        "hex": "6e6e30",
    },
    {
        "name": "mustard yellow",
        "hex": "e1ad01",
    },
    {
        "name": "myrtle green",
        "hex": "317873",
    },
    {
        "name": "mystic",
        "hex": "d65282",
    },
    {
        "name": "mystic maroon",
        "hex": "ad4379",
    },
    {
        "name": "mystic red",
        "hex": "ff5500",
    },
    {
        "name": "naples yellow",
        "hex": "fada5e",
    },
    {
        "name": "natural blue-green",
        "hex": "064e40",
    },
    {
        "name": "natural blue-violet",
        "hex": "4d1a7f",
    },
    {
        "name": "natural green",
        "hex": "00ff00",
    },
    {
        "name": "natural lime",
        "hex": "bfff00",
    },
    {
        "name": "natural orange",
        "hex": "ff7f00",
    },
    {
        "name": "natural red-orange",
        "hex": "ff4500",
    },
    {
        "name": "natural red-violet",
        "hex": "922b3e",
    },
    {
        "name": "natural system blue",
        "hex": "0087bd",
    },
    {
        "name": "natural system green",
        "hex": "009f6b",
    },
    {
        "name": "natural system red",
        "hex": "c40233",
    },
    {
        "name": "natural system yellow",
        "hex": "ffd300",
    },
    {
        "name": "natural violet",
        "hex": "7f00ff",
    },
    {
        "name": "natural yellow orange",
        "hex": "ff9505",
    },
    {
        "name": "natural yellow-green",
        "hex": "30b21a",
    },
    {
        "name": "navajo white",
        "hex": "ffdead",
    },
    {
        "name": "navy blue",
        "hex": "000080",
    },
    {
        "name": "neon blue",
        "hex": "1b03a3",
    },
    {
        "name": "neon green",
        "hex": "39ff14",
    },
    {
        "name": "new car",
        "hex": "214fc6",
    },
    {
        "name": "new york pink",
        "hex": "d7837f",
    },
    {
        "name": "nickel",
        "hex": "727472",
    },
    {
        "name": "non-photo blue",
        "hex": "a4dded",
    },
    {
        "name": "north texas green",
        "hex": "059033",
    },
    {
        "name": "nyanza",
        "hex": "e9ffdb",
    },
    {
        "name": "ocean blue",
        "hex": "4f42b5",
    },
    {
        "name": "ocean boat blue",
        "hex": "0077be",
    },
    {
        "name": "ocean green",
        "hex": "48bf91",
    },
    {
        "name": "ochre",
        "hex": "cc7722",
    },
    {
        "name": "office green",
        "hex": "008000",
    },
    {
        "name": "ogre odor",
        "hex": "fd5240",
    },
    {
        "name": "old burgundy",
        "hex": "43302e",
    },
    {
        "name": "old gold",
        "hex": "cfb53b",
    },
    {
        "name": "old heliotrope",
        "hex": "563c5c",
    },
    {
        "name": "old lace",
        "hex": "fdf5e6",
    },
    {
        "name": "old lavender",
        "hex": "796878",
    },
    {
        "name": "old mauve",
        "hex": "673147",
    },
    {
        "name": "old moss green",
        "hex": "867e36",
    },
    {
        "name": "old rose",
        "hex": "c08081",
    },
    {
        "name": "old silver",
        "hex": "848482",
    },
    {
        "name": "olive",
        "hex": "808000",
    },
    {
        "name": "olive drab",
        "hex": "6b8e23",
    },
    {
        "name": "olive green",
        "hex": "b5b35c",
    },
    {
        "name": "olivine",
        "hex": "9ab973",
    },
    {
        "name": "onyx",
        "hex": "353839",
    },
    {
        "name": "opal",
        "hex": "a8c3bc",
    },
    {
        "name": "opera mauve",
        "hex": "b784a7",
    },
    {
        "name": "orange",
        "hex": "ffa500",
    },
    {
        "name": "orange peel",
        "hex": "ff9f00",
    },
    {
        "name": "orange soda",
        "hex": "fa5b3d",
    },
    {
        "name": "orange-red",
        "hex": "ff681f",
    },
    {
        "name": "orange-yellow",
        "hex": "f5bd1f",
    },
    {
        "name": "orchid",
        "hex": "da70d6",
    },
    {
        "name": "orchid pink",
        "hex": "f2bdcd",
    },
    {
        "name": "orioles orange",
        "hex": "fb4f14",
    },
    {
        "name": "otter brown",
        "hex": "654321",
    },
    {
        "name": "ou crimson red",
        "hex": "990000",
    },
    {
        "name": "outer space",
        "hex": "414a4c",
    },
    {
        "name": "outrageous orange",
        "hex": "ff6e4a",
    },
    {
        "name": "oxblood",
        "hex": "800020",
    },
    {
        "name": "oxford blue",
        "hex": "002147",
    },
    {
        "name": "oxley",
        "hex": "6d9a79",
    },
    {
        "name": "pacific blue",
        "hex": "1ca9c9",
    },
    {
        "name": "pakistan green",
        "hex": "006600",
    },
    {
        "name": "palatinate blue",
        "hex": "273be2",
    },
    {
        "name": "palatinate purple",
        "hex": "682860",
    },
    {
        "name": "pale aqua",
        "hex": "bcd4e6",
    },
    {
        "name": "pale blue",
        "hex": "afeeee",
    },
    {
        "name": "pale brown",
        "hex": "987654",
    },
    {
        "name": "pale carmine",
        "hex": "af4035",
    },
    {
        "name": "pale cerulean",
        "hex": "9bc4e2",
    },
    {
        "name": "pale chestnut",
        "hex": "ddadaf",
    },
    {
        "name": "pale copper",
        "hex": "da8a67",
    },
    {
        "name": "pale cornflower blue",
        "hex": "abcdef",
    },
    {
        "name": "pale cyan",
        "hex": "87d3f8",
    },
    {
        "name": "pale gold",
        "hex": "e6be8a",
    },
    {
        "name": "pale goldenrod",
        "hex": "eee8aa",
    },
    {
        "name": "pale green",
        "hex": "98fb98",
    },
    {
        "name": "pale lavender",
        "hex": "dcd0ff",
    },
    {
        "name": "pale magenta",
        "hex": "f984e5",
    },
    {
        "name": "pale magenta-pink",
        "hex": "ff99cc",
    },
    {
        "name": "pale pink",
        "hex": "fadadd",
    },
    {
        "name": "pale plum",
        "hex": "dda0dd",
    },
    {
        "name": "pale red-violet",
        "hex": "db7093",
    },
    {
        "name": "pale robin egg blue",
        "hex": "96ded1",
    },
    {
        "name": "pale silver",
        "hex": "c9c0bb",
    },
    {
        "name": "pale spring bud",
        "hex": "ecebbd",
    },
    {
        "name": "pale taupe",
        "hex": "bc987e",
    },
    {
        "name": "pale turquoise",
        "hex": "afeeee",
    },
    {
        "name": "pale violet",
        "hex": "cc99ff",
    },
    {
        "name": "pale violet-red",
        "hex": "db7093",
    },
    {
        "name": "palm leaf",
        "hex": "6f9940",
    },
    {
        "name": "pansy purple",
        "hex": "78184a",
    },
    {
        "name": "pantone blue",
        "hex": "0018a8",
    },
    {
        "name": "pantone green",
        "hex": "00ad43",
    },
    {
        "name": "pantone magenta",
        "hex": "d0417e",
    },
    {
        "name": "pantone orange",
        "hex": "ff5800",
    },
    {
        "name": "pantone pink",
        "hex": "d74894",
    },
    {
        "name": "pantone red",
        "hex": "ed2939",
    },
    {
        "name": "pantone yellow",
        "hex": "fedf00",
    },
    {
        "name": "paolo veronese green",
        "hex": "009b7d",
    },
    {
        "name": "papaya whip",
        "hex": "ffefd5",
    },
    {
        "name": "paradise pink",
        "hex": "e63e62",
    },
    {
        "name": "paris green",
        "hex": "50c878",
    },
    {
        "name": "parrot pink",
        "hex": "d998a0",
    },
    {
        "name": "pastel blue",
        "hex": "aec6cf",
    },
    {
        "name": "pastel brown",
        "hex": "836953",
    },
    {
        "name": "pastel gray",
        "hex": "cfcfc4",
    },
    {
        "name": "pastel green",
        "hex": "77dd77",
    },
    {
        "name": "pastel magenta",
        "hex": "f49ac2",
    },
    {
        "name": "pastel orange",
        "hex": "ffb347",
    },
    {
        "name": "pastel pink",
        "hex": "dea5a4",
    },
    {
        "name": "pastel purple",
        "hex": "b39eb5",
    },
    {
        "name": "pastel red",
        "hex": "ff6961",
    },
    {
        "name": "pastel violet",
        "hex": "cb99c9",
    },
    {
        "name": "pastel yellow",
        "hex": "fdfd96",
    },
    {
        "name": "patriarch",
        "hex": "800080",
    },
    {
        "name": "payne's grey",
        "hex": "536878",
    },
    {
        "name": "peach",
        "hex": "ffe5b4",
    },
    {
        "name": "peach",
        "hex": "ffcba4",
    },
    {
        "name": "peach puff",
        "hex": "ffdab9",
    },
    {
        "name": "peach-orange",
        "hex": "ffcc99",
    },
    {
        "name": "peach-yellow",
        "hex": "fadfad",
    },
    {
        "name": "pear",
        "hex": "d1e231",
    },
    {
        "name": "pearl",
        "hex": "eae0c8",
    },
    {
        "name": "pearl aqua",
        "hex": "88d8c0",
    },
    {
        "name": "pearly purple",
        "hex": "b768a2",
    },
    {
        "name": "peridot",
        "hex": "e6e200",
    },
    {
        "name": "periwinkle",
        "hex": "ccccff",
    },
    {
        "name": "permanent geranium lake",
        "hex": "e12c2c",
    },
    {
        "name": "persian blue",
        "hex": "1c39bb",
    },
    {
        "name": "persian green",
        "hex": "00a693",
    },
    {
        "name": "persian indigo",
        "hex": "32127a",
    },
    {
        "name": "persian orange",
        "hex": "d99058",
    },
    {
        "name": "persian pink",
        "hex": "f77fbe",
    },
    {
        "name": "persian plum",
        "hex": "701c1c",
    },
    {
        "name": "persian red",
        "hex": "cc3333",
    },
    {
        "name": "persian rose",
        "hex": "fe28a2",
    },
    {
        "name": "persimmon",
        "hex": "ec5800",
    },
    {
        "name": "peru",
        "hex": "cd853f",
    },
    {
        "name": "pewter blue",
        "hex": "8ba8b7",
    },
    {
        "name": "philippine blue",
        "hex": "0038a7",
    },
    {
        "name": "philippine bronze",
        "hex": "6e3a07",
    },
    {
        "name": "philippine brown",
        "hex": "5d1916",
    },
    {
        "name": "philippine gold",
        "hex": "b17304",
    },
    {
        "name": "philippine golden yellow",
        "hex": "ffdf00",
    },
    {
        "name": "philippine gray",
        "hex": "8c8c8c",
    },
    {
        "name": "philippine green",
        "hex": "008543",
    },
    {
        "name": "philippine orange",
        "hex": "ff7300",
    },
    {
        "name": "philippine pink",
        "hex": "fa1a8e",
    },
    {
        "name": "philippine red",
        "hex": "ce1127",
    },
    {
        "name": "philippine silver",
        "hex": "b3b3b3",
    },
    {
        "name": "philippine violet",
        "hex": "81007f",
    },
    {
        "name": "philippine yellow",
        "hex": "fecb00",
    },
    {
        "name": "phlox",
        "hex": "df00ff",
    },
    {
        "name": "phthalo blue",
        "hex": "000f89",
    },
    {
        "name": "phthalo green",
        "hex": "123524",
    },
    {
        "name": "picton blue",
        "hex": "45b1e8",
    },
    {
        "name": "pictorial carmine",
        "hex": "c30b4e",
    },
    {
        "name": "piggy pink",
        "hex": "fddde6",
    },
    {
        "name": "pigment blue",
        "hex": "333399",
    },
    {
        "name": "pigment green",
        "hex": "00a550",
    },
    {
        "name": "pigment red",
        "hex": "ed1c24",
    },
    {
        "name": "pine green",
        "hex": "01796f",
    },
    {
        "name": "pine tree",
        "hex": "2a2f23",
    },
    {
        "name": "pineapple",
        "hex": "563c0d",
    },
    {
        "name": "pink",
        "hex": "ffc0cb",
    },
    {
        "name": "pink flamingo",
        "hex": "fc74fd",
    },
    {
        "name": "pink lace",
        "hex": "ffddf4",
    },
    {
        "name": "pink lavender",
        "hex": "d8b2d1",
    },
    {
        "name": "pink pearl",
        "hex": "e7accf",
    },
    {
        "name": "pink raspberry",
        "hex": "980036",
    },
    {
        "name": "pink sherbet",
        "hex": "f78fa7",
    },
    {
        "name": "pink-orange",
        "hex": "ff9966",
    },
    {
        "name": "pistachio",
        "hex": "93c572",
    },
    {
        "name": "pixie powder",
        "hex": "391285",
    },
    {
        "name": "platinum",
        "hex": "e5e4e2",
    },
    {
        "name": "plum",
        "hex": "dda0dd",
    },
    {
        "name": "plump purple",
        "hex": "5946b2",
    },
    {
        "name": "police blue",
        "hex": "374f6b",
    },
    {
        "name": "polished pine",
        "hex": "5da493",
    },
    {
        "name": "pomp and power",
        "hex": "86608e",
    },
    {
        "name": "popstar",
        "hex": "be4f62",
    },
    {
        "name": "portland orange",
        "hex": "ff5a36",
    },
    {
        "name": "powder blue",
        "hex": "b0e0e6",
    },
    {
        "name": "princess perfume",
        "hex": "ff85cf",
    },
    {
        "name": "princeton orange",
        "hex": "f58025",
    },
    {
        "name": "process cyan",
        "hex": "00b7eb",
    },
    {
        "name": "process magenta",
        "hex": "ff0090",
    },
    {
        "name": "process yellow",
        "hex": "ffef00",
    },
    {
        "name": "prune",
        "hex": "701c1c",
    },
    {
        "name": "prussian blue",
        "hex": "003153",
    },
    {
        "name": "psychedelic purple",
        "hex": "df00ff",
    },
    {
        "name": "puce",
        "hex": "cc8899",
    },
    {
        "name": "puce red",
        "hex": "722f37",
    },
    {
        "name": "pullman brown, ups brown",
        "hex": "644117",
    },
    {
        "name": "pullman green",
        "hex": "3b331c",
    },
    {
        "name": "pumpkin",
        "hex": "ff7518",
    },
    {
        "name": "purple",
        "hex": "800080",
    },
    {
        "name": "purple (x11)",
        "hex": "a020f0",
    },
    {
        "name": "purple heart",
        "hex": "69359c",
    },
    {
        "name": "purple mountain majesty",
        "hex": "9678b6",
    },
    {
        "name": "purple navy",
        "hex": "4e5180",
    },
    {
        "name": "purple pizzazz",
        "hex": "fe4eda",
    },
    {
        "name": "purple plum",
        "hex": "9c51b6",
    },
    {
        "name": "purple taupe",
        "hex": "50404d",
    },
    {
        "name": "purpureus",
        "hex": "9a4eae",
    },
    {
        "name": "quartz",
        "hex": "51484f",
    },
    {
        "name": "queen blue",
        "hex": "436b95",
    },
    {
        "name": "queen pink",
        "hex": "e8ccd7",
    },
    {
        "name": "quick silver",
        "hex": "a6a6a6",
    },
    {
        "name": "quinacridone magenta",
        "hex": "8e3a59",
    },
    {
        "name": "quincy",
        "hex": "6a5445",
    },
    {
        "name": "rackley",
        "hex": "5d8aa8",
    },
    {
        "name": "radical red",
        "hex": "ff355e",
    },
    {
        "name": "rainbow indigo",
        "hex": "233067",
    },
    {
        "name": "raisin black",
        "hex": "242124",
    },
    {
        "name": "rajah",
        "hex": "fbab60",
    },
    {
        "name": "raspberry",
        "hex": "e30b5d",
    },
    {
        "name": "raspberry glace",
        "hex": "915f6d",
    },
    {
        "name": "raspberry pink",
        "hex": "e25098",
    },
    {
        "name": "raspberry rose",
        "hex": "b3446c",
    },
    {
        "name": "raw sienna",
        "hex": "d68a59",
    },
    {
        "name": "raw umber",
        "hex": "826644",
    },
    {
        "name": "razzle dazzle rose",
        "hex": "ff33cc",
    },
    {
        "name": "razzmatazz",
        "hex": "e3256b",
    },
    {
        "name": "razzmic berry",
        "hex": "8d4e85",
    },
    {
        "name": "real brown",
        "hex": "993300",
    },
    {
        "name": "real orange",
        "hex": "ff6600",
    },
    {
        "name": "real plum",
        "hex": "8e4585",
    },
    {
        "name": "real violet",
        "hex": "8f00ff",
    },
    {
        "name": "rebecca purple",
        "hex": "663399",
    },
    {
        "name": "red",
        "hex": "ff0000",
    },
    {
        "name": "red devil",
        "hex": "860111",
    },
    {
        "name": "red salsa",
        "hex": "fd3a4a",
    },
    {
        "name": "red-brown",
        "hex": "a52a2a",
    },
    {
        "name": "red-orange",
        "hex": "ff5349",
    },
    {
        "name": "red-purple",
        "hex": "e40078",
    },
    {
        "name": "red-violet",
        "hex": "c71585",
    },
    {
        "name": "redwood",
        "hex": "a45a52",
    },
    {
        "name": "regalia",
        "hex": "522d80",
    },
    {
        "name": "registration black",
        "hex": "000000",
    },
    {
        "name": "resolution blue",
        "hex": "002387",
    },
    {
        "name": "rhythm",
        "hex": "777696",
    },
    {
        "name": "rich black",
        "hex": "004040",
    },
    {
        "name": "rich brilliant lavender",
        "hex": "f1a7fe",
    },
    {
        "name": "rich carmine",
        "hex": "d70040",
    },
    {
        "name": "rich carmine, chinese carmine",
        "hex": "d70040",
    },
    {
        "name": "rich electric blue",
        "hex": "0892d0",
    },
    {
        "name": "rich fogra black",
        "hex": "010203",
    },
    {
        "name": "rich gold",
        "hex": "a57c00",
    },
    {
        "name": "rich lavender",
        "hex": "a76bcf",
    },
    {
        "name": "rich lilac",
        "hex": "b666d2",
    },
    {
        "name": "rich liver",
        "hex": "6c2e1f",
    },
    {
        "name": "rich maroon",
        "hex": "b03060",
    },
    {
        "name": "rifle green",
        "hex": "444c38",
    },
    {
        "name": "ripe mango",
        "hex": "ffc324",
    },
    {
        "name": "roast coffee",
        "hex": "704241",
    },
    {
        "name": "robin egg blue",
        "hex": "00cccc",
    },
    {
        "name": "rocket metallic",
        "hex": "8a7f80",
    },
    {
        "name": "roman silver",
        "hex": "838996",
    },
    {
        "name": "root beer",
        "hex": "290e05",
    },
    {
        "name": "rose",
        "hex": "ff007f",
    },
    {
        "name": "rose bonbon",
        "hex": "f9429e",
    },
    {
        "name": "rose dust",
        "hex": "9e5e6f",
    },
    {
        "name": "rose ebony",
        "hex": "674846",
    },
    {
        "name": "rose garnet",
        "hex": "960145",
    },
    {
        "name": "rose gold",
        "hex": "b76e79",
    },
    {
        "name": "rose madder",
        "hex": "e32636",
    },
    {
        "name": "rose pink",
        "hex": "ff66cc",
    },
    {
        "name": "rose quartz",
        "hex": "aa98a9",
    },
    {
        "name": "rose quartz pink",
        "hex": "bd559c",
    },
    {
        "name": "rose red",
        "hex": "c21e56",
    },
    {
        "name": "rose taupe",
        "hex": "905d5d",
    },
    {
        "name": "rose vale",
        "hex": "ab4e52",
    },
    {
        "name": "rosewood",
        "hex": "65000b",
    },
    {
        "name": "rosso corsa",
        "hex": "d40000",
    },
    {
        "name": "rosy brown",
        "hex": "bc8f8f",
    },
    {
        "name": "royal azure",
        "hex": "0038a8",
    },
    {
        "name": "royal blue",
        "hex": "002366",
    },
    {
        "name": "royal blue",
        "hex": "4169e1",
    },
    {
        "name": "royal brown",
        "hex": "523b35",
    },
    {
        "name": "royal fuchsia",
        "hex": "ca2c92",
    },
    {
        "name": "royal green",
        "hex": "136207",
    },
    {
        "name": "royal orange",
        "hex": "f99245",
    },
    {
        "name": "royal pink",
        "hex": "e73895",
    },
    {
        "name": "royal purple",
        "hex": "7851a9",
    },
    {
        "name": "royal red",
        "hex": "9b1c31",
    },
    {
        "name": "royal red",
        "hex": "d00060",
    },
    {
        "name": "royal yellow",
        "hex": "fada5e",
    },
    {
        "name": "ruber",
        "hex": "ce4676",
    },
    {
        "name": "rubine red",
        "hex": "d10056",
    },
    {
        "name": "ruby",
        "hex": "e0115f",
    },
    {
        "name": "ruby red",
        "hex": "9b111e",
    },
    {
        "name": "ruddy",
        "hex": "ff0028",
    },
    {
        "name": "ruddy brown",
        "hex": "bb6528",
    },
    {
        "name": "ruddy pink",
        "hex": "e18e96",
    },
    {
        "name": "rufous",
        "hex": "a81c07",
    },
    {
        "name": "russet",
        "hex": "80461b",
    },
    {
        "name": "russian green",
        "hex": "679267",
    },
    {
        "name": "russian violet",
        "hex": "32174d",
    },
    {
        "name": "rust",
        "hex": "b7410e",
    },
    {
        "name": "rusty red",
        "hex": "da2c43",
    },
    {
        "name": "ryb blue",
        "hex": "0247fe",
    },
    {
        "name": "ryb green",
        "hex": "66b032",
    },
    {
        "name": "ryb orange",
        "hex": "fb9902",
    },
    {
        "name": "ryb red",
        "hex": "fe2712",
    },
    {
        "name": "ryb violet",
        "hex": "8601af",
    },
    {
        "name": "ryb yellow",
        "hex": "fefe33",
    },
    {
        "name": "sacramento state green",
        "hex": "043927",
    },
    {
        "name": "saddle brown",
        "hex": "8b4513",
    },
    {
        "name": "safety orange",
        "hex": "ff7800",
    },
    {
        "name": "safety yellow",
        "hex": "eed202",
    },
    {
        "name": "saffron",
        "hex": "f4c430",
    },
    {
        "name": "sage",
        "hex": "bcb88a",
    },
    {
        "name": "salem",
        "hex": "177b4d",
    },
    {
        "name": "salmon",
        "hex": "fa8072",
    },
    {
        "name": "salmon pink",
        "hex": "ff91a4",
    },
    {
        "name": "sand",
        "hex": "c2b280",
    },
    {
        "name": "sand dune",
        "hex": "967117",
    },
    {
        "name": "sandstorm",
        "hex": "ecd540",
    },
    {
        "name": "sandy brown",
        "hex": "f4a460",
    },
    {
        "name": "sandy tan",
        "hex": "fdd9b5",
    },
    {
        "name": "sandy taupe",
        "hex": "967117",
    },
    {
        "name": "sangria",
        "hex": "92000a",
    },
    {
        "name": "sap green",
        "hex": "507d2a",
    },
    {
        "name": "sapphire",
        "hex": "0f52ba",
    },
    {
        "name": "sapphire blue",
        "hex": "0067a5",
    },
    {
        "name": "sasquatch socks",
        "hex": "ff4681",
    },
    {
        "name": "satin sheen gold",
        "hex": "cba135",
    },
    {
        "name": "scarlet",
        "hex": "ff2400",
    },
    {
        "name": "scarlet",
        "hex": "fd0e35",
    },
    {
        "name": "schauss pink",
        "hex": "ff91af",
    },
    {
        "name": "school bus yellow",
        "hex": "ffd800",
    },
    {
        "name": "screamin' green",
        "hex": "66ff66",
    },
    {
        "name": "sea blue",
        "hex": "006994",
    },
    {
        "name": "sea foam green",
        "hex": "9fe2bf",
    },
    {
        "name": "sea green",
        "hex": "2e8b57",
    },
    {
        "name": "sea serpent",
        "hex": "4bc7cf",
    },
    {
        "name": "seal brown",
        "hex": "59260b",
    },
    {
        "name": "seashell",
        "hex": "fff5ee",
    },
    {
        "name": "selective yellow",
        "hex": "ffba00",
    },
    {
        "name": "sepia",
        "hex": "704214",
    },
    {
        "name": "shadow",
        "hex": "8a795d",
    },
    {
        "name": "shadow blue",
        "hex": "778ba5",
    },
    {
        "name": "shampoo",
        "hex": "ffcff1",
    },
    {
        "name": "shamrock green",
        "hex": "009e60",
    },
    {
        "name": "shandy",
        "hex": "ffe670",
    },
    {
        "name": "sheen green",
        "hex": "8fd400",
    },
    {
        "name": "shimmering blush",
        "hex": "d98695",
    },
    {
        "name": "shiny shamrock",
        "hex": "5fa778",
    },
    {
        "name": "shocking pink",
        "hex": "fc0fc0",
    },
    {
        "name": "sienna",
        "hex": "882d17",
    },
    {
        "name": "silver",
        "hex": "c0c0c0",
    },
    {
        "name": "silver chalice",
        "hex": "acacac",
    },
    {
        "name": "silver foil",
        "hex": "afb1ae",
    },
    {
        "name": "silver lake blue",
        "hex": "5d89ba",
    },
    {
        "name": "silver pink",
        "hex": "c4aead",
    },
    {
        "name": "silver sand",
        "hex": "bfc1c2",
    },
    {
        "name": "sinopia",
        "hex": "cb410b",
    },
    {
        "name": "sizzling red",
        "hex": "ff3855",
    },
    {
        "name": "sizzling sunrise",
        "hex": "ffdb00",
    },
    {
        "name": "skobeloff",
        "hex": "007474",
    },
    {
        "name": "sky blue",
        "hex": "87ceeb",
    },
    {
        "name": "sky magenta",
        "hex": "cf71af",
    },
    {
        "name": "slate blue",
        "hex": "6a5acd",
    },
    {
        "name": "slate gray",
        "hex": "708090",
    },
    {
        "name": "slimy green",
        "hex": "299617",
    },
    {
        "name": "smalt, dark powder blue",
        "hex": "003399",
    },
    {
        "name": "smashed pumpkin",
        "hex": "ff6d3a",
    },
    {
        "name": "smitten",
        "hex": "c84186",
    },
    {
        "name": "smoke",
        "hex": "738276",
    },
    {
        "name": "smokey topaz",
        "hex": "832a0d",
    },
    {
        "name": "smoky black",
        "hex": "100c08",
    },
    {
        "name": "smoky topaz",
        "hex": "933d41",
    },
    {
        "name": "snow",
        "hex": "fffafa",
    },
    {
        "name": "soap",
        "hex": "cec8ef",
    },
    {
        "name": "soldier green",
        "hex": "545a2c",
    },
    {
        "name": "solid pink",
        "hex": "893843",
    },
    {
        "name": "sonic silver",
        "hex": "757575",
    },
    {
        "name": "space cadet",
        "hex": "1d2951",
    },
    {
        "name": "spanish bistre",
        "hex": "807532",
    },
    {
        "name": "spanish blue",
        "hex": "0070b8",
    },
    {
        "name": "spanish carmine",
        "hex": "d10047",
    },
    {
        "name": "spanish crimson",
        "hex": "e51a4c",
    },
    {
        "name": "spanish gray",
        "hex": "989898",
    },
    {
        "name": "spanish green",
        "hex": "009150",
    },
    {
        "name": "spanish orange",
        "hex": "e86100",
    },
    {
        "name": "spanish pink",
        "hex": "f7bfbe",
    },
    {
        "name": "spanish purple",
        "hex": "66033c",
    },
    {
        "name": "spanish red",
        "hex": "e60026",
    },
    {
        "name": "spanish sky blue",
        "hex": "00ffff",
    },
    {
        "name": "spanish violet",
        "hex": "4c2882",
    },
    {
        "name": "spanish viridian",
        "hex": "007f5c",
    },
    {
        "name": "spanish yellow",
        "hex": "f6b511",
    },
    {
        "name": "spartan crimson",
        "hex": "9e1316",
    },
    {
        "name": "spicy mix",
        "hex": "8b5f4d",
    },
    {
        "name": "spiro disco ball",
        "hex": "0fc0fc",
    },
    {
        "name": "spring bud",
        "hex": "a7fc00",
    },
    {
        "name": "spring frost",
        "hex": "87ff2a",
    },
    {
        "name": "spring green",
        "hex": "00ff7f",
    },
    {
        "name": "st. patrick's blue",
        "hex": "23297a",
    },
    {
        "name": "star command blue",
        "hex": "007bb8",
    },
    {
        "name": "steel blue",
        "hex": "4682b4",
    },
    {
        "name": "steel pink",
        "hex": "cc33cc",
    },
    {
        "name": "steel teal",
        "hex": "5f8a8b",
    },
    {
        "name": "stil de grain yellow",
        "hex": "fada5e",
    },
    {
        "name": "stizza",
        "hex": "990000",
    },
    {
        "name": "stormcloud",
        "hex": "4f666a",
    },
    {
        "name": "straw",
        "hex": "e4d96f",
    },
    {
        "name": "strawberry",
        "hex": "fc5a8d",
    },
    {
        "name": "sugar plum",
        "hex": "914e75",
    },
    {
        "name": "sunburnt cyclops",
        "hex": "ff404c",
    },
    {
        "name": "sunglow",
        "hex": "ffcc33",
    },
    {
        "name": "sunny",
        "hex": "f2f27a",
    },
    {
        "name": "sunray",
        "hex": "e3ab57",
    },
    {
        "name": "sunset",
        "hex": "fad6a5",
    },
    {
        "name": "sunset orange",
        "hex": "fd5e53",
    },
    {
        "name": "super pink",
        "hex": "cf6ba9",
    },
    {
        "name": "sweet brown",
        "hex": "a83731",
    },
    {
        "name": "tan",
        "hex": "d2b48c",
    },
    {
        "name": "tangelo",
        "hex": "f94d00",
    },
    {
        "name": "tangerine",
        "hex": "f28500",
    },
    {
        "name": "tangerine yellow",
        "hex": "ffcc00",
    },
    {
        "name": "tango pink",
        "hex": "e4717a",
    },
    {
        "name": "tart orange",
        "hex": "fb4d46",
    },
    {
        "name": "taupe",
        "hex": "483c32",
    },
    {
        "name": "taupe gray",
        "hex": "8b8589",
    },
    {
        "name": "tea green",
        "hex": "d0f0c0",
    },
    {
        "name": "tea rose",
        "hex": "f88379",
    },
    {
        "name": "tea rose",
        "hex": "f4c2c2",
    },
    {
        "name": "teal",
        "hex": "008080",
    },
    {
        "name": "teal blue",
        "hex": "367588",
    },
    {
        "name": "teal deer",
        "hex": "99e6b3",
    },
    {
        "name": "teal green",
        "hex": "00827f",
    },
    {
        "name": "telemagenta",
        "hex": "cf3476",
    },
    {
        "name": "temptress",
        "hex": "3c2126",
    },
    {
        "name": "tenné, tawny",
        "hex": "cd5700",
    },
    {
        "name": "terra cotta",
        "hex": "e2725b",
    },
    {
        "name": "thistle",
        "hex": "d8bfd8",
    },
    {
        "name": "thulian pink",
        "hex": "de6fa1",
    },
    {
        "name": "tickle me pink",
        "hex": "fc89ac",
    },
    {
        "name": "tiffany blue",
        "hex": "0abab5",
    },
    {
        "name": "tiger's eye",
        "hex": "e08d3c",
    },
    {
        "name": "timberwolf",
        "hex": "dbd7d2",
    },
    {
        "name": "titanium",
        "hex": "878681",
    },
    {
        "name": "titanium yellow",
        "hex": "eee600",
    },
    {
        "name": "tomato",
        "hex": "ff6347",
    },
    {
        "name": "toolbox",
        "hex": "746cc0",
    },
    {
        "name": "topaz",
        "hex": "ffc87c",
    },
    {
        "name": "tractor red",
        "hex": "fd0e35",
    },
    {
        "name": "traditional brown",
        "hex": "964b00",
    },
    {
        "name": "traditional chartreuse",
        "hex": "dfff00",
    },
    {
        "name": "traditional chocolate",
        "hex": "7b3f00",
    },
    {
        "name": "traditional forest green",
        "hex": "014421",
    },
    {
        "name": "trolley grey",
        "hex": "808080",
    },
    {
        "name": "tropical rain forest",
        "hex": "00755e",
    },
    {
        "name": "tropical violet",
        "hex": "cda4de",
    },
    {
        "name": "true blue",
        "hex": "0073cf",
    },
    {
        "name": "true green",
        "hex": "008001",
    },
    {
        "name": "tufts blue",
        "hex": "3e8ede",
    },
    {
        "name": "tulip",
        "hex": "ff878d",
    },
    {
        "name": "tumbleweed",
        "hex": "deaa88",
    },
    {
        "name": "turkish rose",
        "hex": "b57281",
    },
    {
        "name": "turquoise",
        "hex": "40e0d0",
    },
    {
        "name": "turquoise blue",
        "hex": "00ffef",
    },
    {
        "name": "turquoise green",
        "hex": "a0d6b4",
    },
    {
        "name": "turquoise surf",
        "hex": "00c5cd",
    },
    {
        "name": "turtle green",
        "hex": "8a9a5b",
    },
    {
        "name": "tuscan",
        "hex": "fad6a5",
    },
    {
        "name": "tuscan brown",
        "hex": "6f4e37",
    },
    {
        "name": "tuscan red",
        "hex": "7c4848",
    },
    {
        "name": "tuscan tan",
        "hex": "a67b5b",
    },
    {
        "name": "tuscany",
        "hex": "c09999",
    },
    {
        "name": "twilight lavender",
        "hex": "8a496b",
    },
    {
        "name": "tyrian purple",
        "hex": "66023c",
    },
    {
        "name": "ua blue",
        "hex": "0033aa",
    },
    {
        "name": "ua red",
        "hex": "d9004c",
    },
    {
        "name": "ube",
        "hex": "8878c3",
    },
    {
        "name": "ucla blue",
        "hex": "536895",
    },
    {
        "name": "ucla gold",
        "hex": "ffb300",
    },
    {
        "name": "ue red",
        "hex": "ba0001",
    },
    {
        "name": "ufo green",
        "hex": "3cd070",
    },
    {
        "name": "ultra pink",
        "hex": "ff6fff",
    },
    {
        "name": "ultra red",
        "hex": "fc6c85",
    },
    {
        "name": "ultramarine",
        "hex": "3f00ff",
    },
    {
        "name": "ultramarine blue",
        "hex": "4166f5",
    },
    {
        "name": "umber",
        "hex": "635147",
    },
    {
        "name": "unbleached silk",
        "hex": "ffddca",
    },
    {
        "name": "united nations blue",
        "hex": "5b92e5",
    },
    {
        "name": "university of california gold",
        "hex": "b78727",
    },
    {
        "name": "university of tennessee orange",
        "hex": "f77f00",
    },
    {
        "name": "unmellow yellow",
        "hex": "ffff66",
    },
    {
        "name": "up forest green",
        "hex": "014421",
    },
    {
        "name": "up maroon",
        "hex": "7b1113",
    },
    {
        "name": "upsdell red",
        "hex": "ae2029",
    },
    {
        "name": "urobilin",
        "hex": "e1ad21",
    },
    {
        "name": "usafa blue",
        "hex": "004f98",
    },
    {
        "name": "usc cardinal",
        "hex": "990000",
    },
    {
        "name": "usc gold",
        "hex": "ffcc00",
    },
    {
        "name": "utah crimson",
        "hex": "d3003f",
    },
    {
        "name": "vampire black",
        "hex": "080808",
    },
    {
        "name": "van dyke brown",
        "hex": "664228",
    },
    {
        "name": "vanilla",
        "hex": "f3e5ab",
    },
    {
        "name": "vanilla ice",
        "hex": "f38fa9",
    },
    {
        "name": "vegas gold",
        "hex": "c5b358",
    },
    {
        "name": "venetian red",
        "hex": "c80815",
    },
    {
        "name": "verdigris",
        "hex": "43b3ae",
    },
    {
        "name": "vermilion",
        "hex": "e34234",
    },
    {
        "name": "vermilion",
        "hex": "d9381e",
    },
    {
        "name": "veronica",
        "hex": "a020f0",
    },
    {
        "name": "verse green",
        "hex": "18880d",
    },
    {
        "name": "very light azure",
        "hex": "74bbfb",
    },
    {
        "name": "very light blue",
        "hex": "6666ff",
    },
    {
        "name": "very light malachite green",
        "hex": "64e986",
    },
    {
        "name": "very light tangelo",
        "hex": "ffb077",
    },
    {
        "name": "very pale orange",
        "hex": "ffdfbf",
    },
    {
        "name": "very pale yellow",
        "hex": "ffffbf",
    },
    {
        "name": "violet",
        "hex": "ee82ee",
    },
    {
        "name": "violet-blue",
        "hex": "324ab2",
    },
    {
        "name": "violet-red",
        "hex": "f75394",
    },
    {
        "name": "violet-red",
        "hex": "891446",
    },
    {
        "name": "violin brown",
        "hex": "674403",
    },
    {
        "name": "viridian",
        "hex": "40826d",
    },
    {
        "name": "viridian green",
        "hex": "009698",
    },
    {
        "name": "vista blue",
        "hex": "7c9ed9",
    },
    {
        "name": "vivid amber",
        "hex": "cc9900",
    },
    {
        "name": "vivid auburn",
        "hex": "922724",
    },
    {
        "name": "vivid burgundy",
        "hex": "9f1d35",
    },
    {
        "name": "vivid cerise",
        "hex": "da1d81",
    },
    {
        "name": "vivid cerulean",
        "hex": "00aaee",
    },
    {
        "name": "vivid crimson",
        "hex": "cc0033",
    },
    {
        "name": "vivid gamboge",
        "hex": "ff9900",
    },
    {
        "name": "vivid lime green",
        "hex": "a6d608",
    },
    {
        "name": "vivid malachite",
        "hex": "00cc33",
    },
    {
        "name": "vivid mulberry",
        "hex": "b80ce3",
    },
    {
        "name": "vivid orange",
        "hex": "ff5f00",
    },
    {
        "name": "vivid orange peel",
        "hex": "ffa000",
    },
    {
        "name": "vivid orchid",
        "hex": "cc00ff",
    },
    {
        "name": "vivid raspberry",
        "hex": "ff006c",
    },
    {
        "name": "vivid red",
        "hex": "f70d1a",
    },
    {
        "name": "vivid red-tangelo",
        "hex": "df6124",
    },
    {
        "name": "vivid sky blue",
        "hex": "00ccff",
    },
    {
        "name": "vivid tangelo",
        "hex": "f07427",
    },
    {
        "name": "vivid tangerine",
        "hex": "ffa089",
    },
    {
        "name": "vivid vermilion",
        "hex": "e56024",
    },
    {
        "name": "vivid violet",
        "hex": "9f00ff",
    },
    {
        "name": "vivid yellow",
        "hex": "ffe302",
    },
    {
        "name": "vodka",
        "hex": "bfc0ee",
    },
    {
        "name": "volt",
        "hex": "ceff00",
    },
    {
        "name": "wageningen green",
        "hex": "34b233",
    },
    {
        "name": "warm black",
        "hex": "004242",
    },
    {
        "name": "water",
        "hex": "d4f1f9",
    },
    {
        "name": "watermelon",
        "hex": "f05c85",
    },
    {
        "name": "watermelon red",
        "hex": "bf4147",
    },
    {
        "name": "waterspout",
        "hex": "a4f4f9",
    },
    {
        "name": "weldon blue",
        "hex": "7c98ab",
    },
    {
        "name": "wenge",
        "hex": "645452",
    },
    {
        "name": "wheat",
        "hex": "f5deb3",
    },
    {
        "name": "white",
        "hex": "ffffff",
    },
    {
        "name": "white chocolate",
        "hex": "ede6d6",
    },
    {
        "name": "white coffee",
        "hex": "e6e0d4",
    },
    {
        "name": "white smoke",
        "hex": "f5f5f5",
    },
    {
        "name": "wild blue yonder",
        "hex": "a2add0",
    },
    {
        "name": "wild orchid",
        "hex": "d470a2",
    },
    {
        "name": "wild strawberry",
        "hex": "ff43a4",
    },
    {
        "name": "wild watermelon",
        "hex": "fc6c85",
    },
    {
        "name": "willpower orange",
        "hex": "fd5800",
    },
    {
        "name": "windsor tan",
        "hex": "a75502",
    },
    {
        "name": "wine",
        "hex": "722f37",
    },
    {
        "name": "wine dregs",
        "hex": "673147",
    },
    {
        "name": "wine red",
        "hex": "b11226",
    },
    {
        "name": "winter sky",
        "hex": "ff007c",
    },
    {
        "name": "winter wizard",
        "hex": "a0e6ff",
    },
    {
        "name": "wintergreen dream",
        "hex": "56887d",
    },
    {
        "name": "wisteria",
        "hex": "c9a0dc",
    },
    {
        "name": "wood brown",
        "hex": "c19a6b",
    },
    {
        "name": "xanadu",
        "hex": "738678",
    },
    {
        "name": "yale blue",
        "hex": "0f4d92",
    },
    {
        "name": "yankees blue",
        "hex": "1c2841",
    },
    {
        "name": "yellow",
        "hex": "ffff00",
    },
    {
        "name": "yellow orange",
        "hex": "ffae42",
    },
    {
        "name": "yellow rose",
        "hex": "fff000",
    },
    {
        "name": "yellow sunshine",
        "hex": "fff700",
    },
    {
        "name": "yellow-green",
        "hex": "9acd32",
    },
    {
        "name": "yinmn blue",
        "hex": "2e5090",
    },
    {
        "name": "zaffre",
        "hex": "0014a8",
    },
    {
        "name": "zinnwaldite brown",
        "hex": "2c1608",
    },
    {
        "name": "zomp",
        "hex": "39a78e",
    }
];
}

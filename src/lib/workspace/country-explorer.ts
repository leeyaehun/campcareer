/**
 * Geographic drill-down data for the Countries explorer.
 *
 * Regions and cities are public geographic facts (states/provinces and major
 * cities of each launch country). They power the country → region → city
 * hierarchy used by the workspace Countries page.
 */

export type RegionEntry = {
  name: string
  cities: string[]
}

export type CountryExplorerEntry = {
  code: string
  regions: RegionEntry[]
}

export const COUNTRY_EXPLORER: readonly CountryExplorerEntry[] = [
  {
    code: "AU",
    regions: [
      { name: "New South Wales", cities: ["Sydney", "Newcastle", "Wollongong", "Central Coast"] },
      { name: "Victoria", cities: ["Melbourne", "Geelong", "Ballarat", "Bendigo"] },
      { name: "Queensland", cities: ["Brisbane", "Gold Coast", "Cairns", "Townsville"] },
      { name: "Western Australia", cities: ["Perth", "Bunbury", "Geraldton", "Albany"] },
      { name: "South Australia", cities: ["Adelaide", "Mount Gambier", "Whyalla"] },
      { name: "Tasmania", cities: ["Hobart", "Launceston", "Devonport"] },
      { name: "Australian Capital Territory", cities: ["Canberra"] },
      { name: "Northern Territory", cities: ["Darwin", "Alice Springs"] },
    ],
  },
  {
    code: "CA",
    regions: [
      { name: "Ontario", cities: ["Toronto", "Ottawa", "Hamilton", "Waterloo", "London"] },
      { name: "British Columbia", cities: ["Vancouver", "Victoria", "Kelowna", "Surrey"] },
      { name: "Quebec", cities: ["Montreal", "Quebec City", "Sherbrooke", "Gatineau"] },
      { name: "Alberta", cities: ["Calgary", "Edmonton", "Lethbridge"] },
      { name: "Manitoba", cities: ["Winnipeg", "Brandon"] },
      { name: "Saskatchewan", cities: ["Saskatoon", "Regina"] },
      { name: "Nova Scotia", cities: ["Halifax", "Sydney"] },
      { name: "New Brunswick", cities: ["Moncton", "Fredericton"] },
    ],
  },
  {
    code: "US",
    regions: [
      { name: "California", cities: ["San Francisco", "Los Angeles", "San Diego", "Sacramento"] },
      { name: "New York", cities: ["New York City", "Buffalo", "Rochester"] },
      { name: "Texas", cities: ["Houston", "Austin", "Dallas", "San Antonio"] },
      { name: "Washington", cities: ["Seattle", "Spokane", "Bellevue"] },
      { name: "Illinois", cities: ["Chicago", "Naperville"] },
      { name: "Massachusetts", cities: ["Boston", "Cambridge"] },
      { name: "Florida", cities: ["Miami", "Orlando", "Tampa"] },
      { name: "Colorado", cities: ["Denver", "Boulder"] },
      { name: "Georgia", cities: ["Atlanta", "Savannah"] },
      { name: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh"] },
    ],
  },
  {
    code: "UK",
    regions: [
      { name: "England", cities: ["London", "Manchester", "Birmingham", "Leeds", "Liverpool"] },
      { name: "Scotland", cities: ["Glasgow", "Edinburgh", "Aberdeen", "Dundee"] },
      { name: "Wales", cities: ["Cardiff", "Swansea", "Newport"] },
      { name: "Northern Ireland", cities: ["Belfast", "Derry"] },
    ],
  },
  {
    code: "IE",
    regions: [
      { name: "Leinster", cities: ["Dublin", "Kilkenny", "Drogheda"] },
      { name: "Munster", cities: ["Cork", "Limerick", "Waterford"] },
      { name: "Connacht", cities: ["Galway", "Sligo", "Castlebar"] },
      { name: "Ulster", cities: ["Donegal", "Cavan", "Monaghan"] },
    ],
  },
  {
    code: "DE",
    regions: [
      { name: "Bavaria", cities: ["Munich", "Nuremberg", "Augsburg"] },
      { name: "Berlin", cities: ["Berlin"] },
      { name: "Hamburg", cities: ["Hamburg"] },
      { name: "Hesse", cities: ["Frankfurt", "Wiesbaden", "Darmstadt"] },
      { name: "North Rhine-Westphalia", cities: ["Cologne", "Dusseldorf", "Dortmund", "Essen"] },
      { name: "Baden-Wurttemberg", cities: ["Stuttgart", "Mannheim", "Freiburg"] },
      { name: "Saxony", cities: ["Leipzig", "Dresden"] },
    ],
  },
  {
    code: "NL",
    regions: [
      { name: "North Holland", cities: ["Amsterdam", "Haarlem", "Alkmaar"] },
      { name: "South Holland", cities: ["Rotterdam", "The Hague", "Leiden", "Delft"] },
      { name: "Utrecht", cities: ["Utrecht", "Amersfoort"] },
      { name: "North Brabant", cities: ["Eindhoven", "Tilburg", "Breda"] },
      { name: "Gelderland", cities: ["Nijmegen", "Arnhem"] },
    ],
  },
  {
    code: "BE",
    regions: [
      { name: "Flanders", cities: ["Antwerp", "Ghent", "Bruges", "Leuven"] },
      { name: "Brussels", cities: ["Brussels"] },
      { name: "Wallonia", cities: ["Liege", "Namur", "Charleroi"] },
    ],
  },
  {
    code: "FR",
    regions: [
      { name: "Ile-de-France", cities: ["Paris", "Versailles", "Boulogne-Billancourt"] },
      { name: "Auvergne-Rhone-Alpes", cities: ["Lyon", "Grenoble", "Saint-Etienne"] },
      { name: "Provence-Alpes-Cote d'Azur", cities: ["Marseille", "Nice", "Aix-en-Provence"] },
      { name: "Nouvelle-Aquitaine", cities: ["Bordeaux", "Limoges", "Poitiers"] },
      { name: "Occitanie", cities: ["Toulouse", "Montpellier", "Nimes"] },
      { name: "Hauts-de-France", cities: ["Lille", "Amiens", "Arras"] },
    ],
  },
  {
    code: "ES",
    regions: [
      { name: "Community of Madrid", cities: ["Madrid", "Alcala de Henares"] },
      { name: "Catalonia", cities: ["Barcelona", "Girona", "Tarragona"] },
      { name: "Andalusia", cities: ["Seville", "Malaga", "Granada", "Cordoba"] },
      { name: "Valencian Community", cities: ["Valencia", "Alicante", "Castellon"] },
      { name: "Basque Country", cities: ["Bilbao", "San Sebastian", "Vitoria-Gasteiz"] },
      { name: "Galicia", cities: ["Vigo", "A Coruna", "Santiago de Compostela"] },
    ],
  },
  {
    code: "SG",
    regions: [
      { name: "Central Region", cities: ["Marina Bay", "Orchard", "Chinatown", "Raffles Place"] },
      { name: "East Region", cities: ["Changi", "Bedok", "Tampines"] },
      { name: "North-East Region", cities: ["Punggol", "Sengkang", "Serangoon"] },
      { name: "North Region", cities: ["Woodlands", "Ang Mo Kio", "Sembawang"] },
      { name: "West Region", cities: ["Jurong East", "Clementi", "Bukit Batok"] },
    ],
  },
  {
    code: "KR",
    regions: [
      { name: "Seoul", cities: ["Seoul"] },
      { name: "Gyeonggi", cities: ["Suwon", "Seongnam", "Goyang", "Yongin"] },
      { name: "Busan", cities: ["Busan"] },
      { name: "Incheon", cities: ["Incheon"] },
      { name: "Daegu", cities: ["Daegu"] },
      { name: "Daejeon", cities: ["Daejeon"] },
      { name: "Gwangju", cities: ["Gwangju"] },
      { name: "Jeju", cities: ["Jeju City", "Seogwipo"] },
    ],
  },
  {
    code: "JP",
    regions: [
      { name: "Tokyo", cities: ["Tokyo"] },
      { name: "Osaka", cities: ["Osaka", "Sakai"] },
      { name: "Kanagawa", cities: ["Yokohama", "Kawasaki"] },
      { name: "Aichi", cities: ["Nagoya", "Toyota"] },
      { name: "Hokkaido", cities: ["Sapporo", "Asahikawa"] },
      { name: "Fukuoka", cities: ["Fukuoka", "Kitakyushu"] },
      { name: "Kyoto", cities: ["Kyoto", "Uji"] },
      { name: "Hyogo", cities: ["Kobe", "Himeji"] },
    ],
  },
  {
    code: "NZ",
    regions: [
      { name: "North Island", cities: ["Auckland", "Wellington", "Hamilton", "Tauranga"] },
      { name: "South Island", cities: ["Christchurch", "Dunedin", "Queenstown", "Nelson"] },
    ],
  },
  {
    code: "NO",
    regions: [
      { name: "Eastern Norway", cities: ["Oslo", "Drammen", "Fredrikstad"] },
      { name: "Western Norway", cities: ["Bergen", "Stavanger", "Haugesund"] },
      { name: "Trondelag", cities: ["Trondheim"] },
      { name: "Northern Norway", cities: ["Tromso", "Bodo", "Alta"] },
      { name: "Southern Norway", cities: ["Kristiansand", "Arendal"] },
    ],
  },
  {
    code: "SE",
    regions: [
      { name: "Stockholm County", cities: ["Stockholm", "Sodertalje"] },
      { name: "Vastra Gotaland", cities: ["Gothenburg", "Boras", "Trollhattan"] },
      { name: "Skane", cities: ["Malmo", "Helsingborg", "Lund"] },
      { name: "Uppsala County", cities: ["Uppsala"] },
      { name: "Ostergotland", cities: ["Linkoping", "Norrkoping"] },
    ],
  },
  {
    code: "DK",
    regions: [
      { name: "Capital Region", cities: ["Copenhagen", "Frederiksberg", "Hillerod"] },
      { name: "Central Denmark", cities: ["Aarhus", "Randers", "Silkeborg"] },
      { name: "North Denmark", cities: ["Aalborg", "Hjorring"] },
      { name: "Southern Denmark", cities: ["Odense", "Esbjerg", "Kolding"] },
      { name: "Zealand", cities: ["Roskilde", "Elsinore", "Nykobing"] },
    ],
  },
  {
    code: "FI",
    regions: [
      { name: "Uusimaa", cities: ["Helsinki", "Espoo", "Vantaa"] },
      { name: "Pirkanmaa", cities: ["Tampere"] },
      { name: "Southwest Finland", cities: ["Turku"] },
      { name: "North Ostrobothnia", cities: ["Oulu"] },
      { name: "Central Finland", cities: ["Jyvaskyla"] },
      { name: "Lapland", cities: ["Rovaniemi", "Kemi"] },
    ],
  },
  {
    code: "CH",
    regions: [
      { name: "Zurich", cities: ["Zurich", "Winterthur"] },
      { name: "Bern", cities: ["Bern", "Biel"] },
      { name: "Geneva", cities: ["Geneva"] },
      { name: "Basel-Stadt", cities: ["Basel"] },
      { name: "Vaud", cities: ["Lausanne", "Montreux", "Vevey"] },
      { name: "Ticino", cities: ["Lugano", "Locarno"] },
    ],
  },
  {
    code: "AE",
    regions: [
      { name: "Dubai", cities: ["Dubai"] },
      { name: "Abu Dhabi", cities: ["Abu Dhabi", "Al Ain"] },
      { name: "Sharjah", cities: ["Sharjah"] },
      { name: "Ajman", cities: ["Ajman"] },
      { name: "Ras Al Khaimah", cities: ["Ras Al Khaimah"] },
      { name: "Fujairah", cities: ["Fujairah"] },
      { name: "Umm Al Quwain", cities: ["Umm Al Quwain"] },
    ],
  },
]

const byCode = new Map(COUNTRY_EXPLORER.map((entry) => [entry.code, entry]))

export function getCountryExplorer(code: string) {
  return byCode.get(code.toUpperCase()) ?? null
}

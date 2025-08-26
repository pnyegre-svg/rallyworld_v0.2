

export type UserRole = 
  | 'organizer' 
  | 'competitor' 
  | 'stage_commander' 
  | 'timekeeper' 
  | 'scrutineer' 
  | 'event_secretary' 
  | 'communications_officer'
  | 'competitor_relations_officer'
  | 'fan';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roles: UserRole[];
  currentRole: UserRole;
  organizerProfile?: Organizer;
};

export type Organizer = {
    id: string;
    name: string;
    cis: string;
    cif: string;
    address: string;
    phone?: string;
    email: string;
    website?: string;
    socials?: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
        tiktok?: string;
        x?: string;
    }
    profilePicture?: string;
}

export type Club = {
    id: string;
    name: string;
    cis: string;
    cif: string;
    address: string;
}

export type Competitor = {
  id: string;
  name: string;
  team: string;
  country: string;
  avatar: string;
  vehicle: string;
};

export type Stage = {
  id: string;
  name: string;
  location: string;
  distance: number;
  status: 'upcoming' | 'live' | 'completed';
};

export type NewsPost = {
  id: string;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  type: 'event' | 'system';
};

export type LeaderboardEntry = {
    rank: number;
    competitor: Competitor;
    totalTime: string;
    stageTimes: { stageId: string; time: string }[];
};

export const users: User[] = [
  { id: 'usr_001', name: 'Rally Club Admin', email: 'admin@rally.world', avatar: '/avatars/01.png', roles: ['organizer', 'fan'], currentRole: 'organizer' },
  { id: 'usr_002', name: 'Maria Garcia', email: 'maria.g@example.com', avatar: '/avatars/02.png', roles: ['timekeeper', 'fan'], currentRole: 'timekeeper' },
  { id: 'usr_003', name: 'Kenji Tanaka', email: 'kenji.t@example.com', avatar: '/avatars/03.png', roles: ['competitor', 'fan'], currentRole: 'competitor' },
  { id: 'usr_004', name: 'Chloe Dubois', email: 'chloe.d@example.com', avatar: '/avatars/04.png', roles: ['fan'], currentRole: 'fan' },
  { id: 'usr_005', name: 'Ben Carter', email: 'ben.c@example.com', avatar: '/avatars/05.png', roles: ['fan'], currentRole: 'fan' },
];

export const clubs: Club[] = [
    { id: "club_1", name: "Club Sportiv AUTO SPORT FAIR PLAY", cis: "AB/A2/00115/2006", cif: "18624007", address: "Str. Tăbăcarilor nr. 3A, Abrud, jud. Alba, 515100" },
    { id: "club_2", name: "Asociatia Club Sportiv ALBA OFF ROAD", cis: "AB/A2/00185/2016", cif: "31626579", address: "Str. Moților nr. 117, Alba Iulia, jud. Alba" },
    { id: "club_3", name: "Asociatia Club Sportiv OFF-ROAD APUSENI", cis: "AB/A2/00356/2023", cif: "41628593", address: "Str. Panduri nr. 15, Abrud, jud. Alba, 515100" },
    { id: "club_4", name: "Asociatia Club Sportiv SOLO RALLY TEAM", cis: "AG/A2/00078/2025", cif: "51282593", address: "Str. Principală nr. FN, Punctul Căminul Casei CF 80475, Lăzărești, jud. Argeș" },
    { id: "club_5", name: "Asociatia Club Sportiv BON MOTOR-SPORT", cis: "AG/A2/00361/2024", cif: "50400623", address: "Str. Principală nr. 31A, Piscani, jud. Argeș" },
    { id: "club_6", name: "Asociatia Club Sportiv UXO TEAM CÂMPULUNG", cis: "AG/A2/00026/2024", cif: "49243029", address: "Str. Câmpulungului nr. 3, Bughea de Jos, jud. Argeș" },
    { id: "club_7", name: "Asociatia Club Sportiv ANDREI DUNA ACADEMY", cis: "AG/A2/00043/2023", cif: "47249114", address: "Str. Constantin Dudescu nr. 11A, bl. C.D. 11A, et. 1, ap. 3, Pitești, jud. Argeș" },
    { id: "club_8", name: "Asociatia Club Sportiv STAR MOTORSPORT", cis: "AG/A2/00419/2021", cif: "45426040", address: "Str. Principală nr. 357, punctul \"Canton\", Mărăcineni, jud. Argeș" },
    { id: "club_9", name: "ASOCIAȚIA CLUB SPORTIV WHEELS RACING", cis: "AG/A2/00418/2021", cif: "38714368", address: "DN 65B nr. FN, km 3+721m, camera 1, Pitești, jud. Argeș" },
    { id: "club_10", name: "Asociatia Club Sportiv KELLU MOTORSPORT", cis: "AG/A2/00318/2021", cif: "45002109", address: "Schitu Golești, jud. Argeș" },
    { id: "club_11", name: "Asociatia Club Sportiv NIC BROTHER MOTORSPORT", cis: "AG/A2/00325/2021", cif: "45751741", address: "Str. Grigore Alexandrescu nr. 8, Câmpulung, jud. Argeș" },
    { id: "club_12", name: "Club Sportiv VĂRU NICU MOTORSPORT", cis: "AG/A2/00278/2020", cif: "30229031", address: "Str. Primăverii nr. 55, Mioveni, jud. Argeș, 110186" },
    { id: "club_13", name: "Asociatia Club Sportiv RB RACING", cis: "AG/A2/00151/2019", cif: "40677628", address: "Str. Valea Foii nr. 12, Voinești, com. Lerești, jud. Argeș, 117432" },
    { id: "club_14", name: "Asociatia Club Sportiv DTO RALLY", cis: "AG/A2/00056/2019", cif: "40659885", address: "B-dul Republicii nr. 139, Pitești, jud. Argeș" },
    { id: "club_15", name: "Club Sportiv PROCAR RACING TEAM PITEȘTI", cis: "AG/A2/00132/2008", cif: "24221777", address: "Aleea Alexandru Valescu nr. 4, Pitești, jud. Argeș, 110255" },
    { id: "club_16", name: "Asociatia Club Sportiv FIRST CLUB CUP", cis: "AG/A2/00146/2015", cif: "34030766", address: "Str. Frații Golești nr. 30, Câmpulung, jud. Argeș" },
    { id: "club_17", name: "Asociatia Club Sportiv RALLY DJV", cis: "AG/A2/00151/2007", cif: "21062553", address: "Str. Exercițiu nr. 93, Bl. D18, Sc. B, Et. P, Ap. 3, Pitești, jud. Argeș" },
    { id: "club_18", name: "Asociatia Club Sportiv BROTHERS MOTOR SPORT", cis: "AG/A2/00179/2005", cif: "17783462", address: "Str. Dr. Ion Nanu Mușcel nr. 4A, Câmpulung, jud. Argeș" },
    { id: "club_19", name: "Asociatia Club Sportiv DE AUTOMOBILISM DACIA ARGESSOS", cis: "AG/A2/00195/2014", cif: "32981099", address: "Str. Nicolae Titulescu nr. 57, Colibași, jud. Argeș" },
    { id: "club_20", name: "Asociatia Club Sportiv HATTERS MOTORSPORT", cis: "AG/A2/00322/2009", cif: "25913946", address: "Str. Ion C. Brătianu nr. 4A, Bl. B1, Sc. C, Ap. 13, Câmpulung, jud. Argeș" },
    { id: "club_21", name: "Asociatia Club Sportiv AUTO VOLAN PITEȘTI", cis: "AG/A2/00344/2003", cif: "7175719", address: "Str. Nirajului nr. 35, Miercurea Nirajului, jud. Mureș" },
    { id: "club_22", name: "A.S. SPRINT CLUB MIOVENI", cis: "AG/A2/00358/2003", cif: "16010191", address: "Str. Frații Golești, Mioveni, jud. Argeș, 115400" },
    { id: "club_23", name: "Club Sportiv VALLINO RALLY TEAM", cis: "AG/A2/00368/2009", cif: "26342252", address: "Str. Exercițiu, Pitești, jud. Argeș, 110409" },
    { id: "club_24", name: "Asociatia Club Sportiv ANTO RALLY TEAM", cis: "AG/A2/00121/2022", cif: "46149087", address: "Str. Principală nr. 385A, Micești, jud. Argeș" },
    { id: "club_25", name: "Asociatia Club Sportiv ALEX RALLY SPEED PITEȘTI", cis: "AG/A2/00197/2017", cif: "37108908", address: "Str. Trandafirilor nr. 1, Pitești, jud. Argeș, 110067" },
    { id: "club_26", name: "A.C.S. RODRAG RACING", cis: "AR/A2/00046/2024", cif: "49351489", address: "Str. 6 Vânătorii nr. 55, Arad, jud. Arad" },
    { id: "club_27", name: "A.C.S CARSX", cis: "AR/A2/00343/2023", cif: "48891618", address: "Str. 6 Vânătorii nr. 55, Arad, jud. Arad" },
    { id: "club_28", name: "ASOCIAȚIA OFF ROAD CLUB ARAD", cis: "AR/A2/00120/2010", cif: "21553852", address: "Str. Principală nr. 145, Șagu, jud. Arad" },
    { id: "club_29", name: "Asociatia Club Sportiv MARIUS MITRACHE DRIFT", cis: "B/A2/00352/2024", cif: "47687033", address: "Str. Iedului nr. 3, Bl. 149A, Sc. 1, Et. 1, Ap. 7, Sector 6, București" },
    { id: "club_30", name: "A.C.S MUNTENIA MOTORSPORT", cis: "B/A2/00020/2025", cif: "51198264", address: "Str. Dezrobirii nr. O8, Sc. 3, Et. 6, Ap. 146, Sector 6, București" },
    { id: "club_31", name: "ACS UNITED RACE SPORTS", cis: "B/A2/00016/2024", cif: "47325572", address: "Str. Heliade între Vii nr. 8, Corp C20, Hala 15, Sector 2, București" },
    { id: "club_32", name: "Asociatia Club Sportiv AMI RACING", cis: "B/A2/00366/2024", cif: "50298818", address: "Șos. București-Ploiești nr. 87E, Sector 1, București" },
    { id: "club_33", name: "Club Sportiv UNIVERSITAR ‘ASE’ BUCUREȘTI", cis: "B/A1/00039/2017", cif: "Blank", address: "Blank" },
    { id: "club_34", name: "Asociatia Club Sportiv SORIN ENE", cis: "B/A2/00324/2023", cif: "48087240", address: "Str. Crinul de Pădure nr. 2, Bl. F2, Sc. C, Et. 1, Ap. 47, Sector 6, București" },
    { id: "club_35", name: "Asociatia Club Sportiv OFFROAD CLUB 4X4 ENERGY", cis: "B/A2/00262/2022", cif: "47627511", address: "Bd. Iuliu Maniu nr. 18, Bl. 15A+B, Sc. A, Et. 2, Ap. 10, Sector 6, București" },
    { id: "club_36", name: "Asociatia Club Sportiv MOTORSPORT RACE MANAGEMENT", cis: "B/A2/00125/2013", cif: "32081909", address: "Sector 2, București" },
    { id: "club_37", name: "*ASOCIAȚIA ONO41 RACING", cis: "B/A2/00089/2014", cif: "23307080", address: "Str. Căiuți nr. 18, Sector 1, București" },
    { id: "club_38", name: "Asociatia Club Sportiv JUNIOR MOTORSPORT", cis: "B/A2/00480/2021", cif: "44593457", address: "Str. Fetițelor nr. 2, Mansardă, Sector 3, București" },
    { id: "club_39", name: "Asociatia Club Sportiv MUFLON MOTORSPORT BUCUREȘTI", cis: "B/A2/00343/2021", cif: "47842560", address: "Str. Sold. Ene Modoran nr. 12, Bl. M179, Sc. 1, Et. 2, Ap. 14, Sector 5, București" },
    { id: "club_40", name: "Asociatia Club Sportiv HOBBY MOTORSPORT", cis: "B/A2/00295/2020", cif: "30070296", address: "Str. Poiana Vadului nr. 3, Bl. E26, Sc. A, Et. 10, Ap. 54, Sector 6, București" },
    { id: "club_41", name: "Asociatia Club Sportiv SLOW TEAM – ECHIPA LENTĂ", cis: "B/A2/00179/2020", cif: "41923232", address: "Str. Gabroveni nr. 61, sc. C, et. 3, ap. 9, camera 2, biroul 6, Sector 3, București" },
    { id: "club_42", name: "Asociatia Club Sportiv TEAM RACING FRIENDS", cis: "B/A2/00132/2020", cif: "42038310", address: "Str. Vulcan nr. 31-35, Sector 3, București" },
    { id: "club_43", name: "Asociatia Club Sportiv CARPATHIAN OFF ROAD", cis: "B/A2/00126/2020", cif: "39622661", address: "Șos. Pantelimon nr. 254, bl. 55, sc. B, et. 1, ap. 56, Sector 2, București" },
    { id: "club_44", name: "Asociatia Club Sportiv RISK RACING", cis: "B/A2/00267/2019", cif: "41403477", address: "Str. Rușchița nr. 28, parter, camera 1, Sector 2, București" },
    { id: "club_45", name: "Asociatia Club Sportiv WILLI MSPORT BUCUREȘTI", cis: "B/A2/00071/2014", cif: "32102823", address: "Str. Salva nr. 22, Sector 1, București" },
    { id: "club_46", name: "ASOCIAȚIA GT AUTO CLUB SPORTIV", cis: "B/A2/00314/2010", cif: "27767480", address: "Valea Cricovului nr. 58B, Bl. Cam. 1, Sector 6, București" },
    { id: "club_47", name: "Asociatia Club Sportiv BEST RIDE", cis: "B/A2/00348/2017", cif: "37252490", address: "Str. Oltului nr. 12, Ap. Camera 1, Sector 5, București" },
    { id: "club_48", name: "Asociatia Club Sportiv BAJA 500 MOTORSPORT", cis: "B/A2/00209/2019", cif: "41062728", address: "Șos. București-Târgoviște nr. 236, Camera 2, Crevedia, jud. Dâmbovița" },
    { id: "club_49", name: "Asociatia Club Sportiv TEAM 4X4", cis: "B/A2/00008/2011", cif: "27829435", address: "Str. Cpt. Octav Cocărăscu nr. 2, Et. Subsol, Sector 1, București" },
    { id: "club_50", name: "RS RACING", cis: "B/A2/00008/2012", cif: "28698010", address: "Str. Pădurea Pustnicu nr. 147, Bl. 03B/2, Et. 3, Ap. 7, Sector 1, București" },
    { id: "club_51", name: "Asociatia Club Sportiv CRG ROMÂNIA", cis: "B/A2/00016/2010", cif: "26301368", address: "Str. Pitar Moș nr. 17, Sector 1, București" },
    { id: "club_52", name: "A.C. OFF ROAD BUCUREȘTI (C.O.R.B. 44)", cis: "B/A2/00030/2010", cif: "24456641", address: "Str. Silvia nr. 41, Sector 2, București" },
    { id: "club_53", name: "Club Sportiv AUTO SOLUTION", cis: "B/A2/00039/2006", cif: "Blank", address: "Blank" },
    { id: "club_54", name: "Asociatia Club Sportiv ALL STARS MOTORSPORTS", cis: "B/A2/00041/2016", cif: "35171909", address: "Str. Nicolaie Racotă nr. 17, Bl. 80, Sc. 2, Ap. 16, Sector 1, București" },
    { id: "club_55", name: "Club Sportiv SPEED TAXI MOTORSPORT", cis: "B/A2/00055/2017", cif: "36793306", address: "Str. Oinei nr. 43, Et. 2, Cam. 1, Sector 1, București" },
    { id: "club_56", name: "Asociatia Club Sportiv ADRENALINE MOTORSPORT", cis: "B/A2/00091/2015", cif: "33925623", address: "Str. Taberei nr. 92, Bl. C7, Sc. A, Et. 10, Ap. 40, Sector 6, București" },
    { id: "club_57", name: "Asociatia Club Sportiv AUTOTEHNICA", cis: "B/A2/00097/2007", cif: "19237521", address: "Str. Intrarea Episcop Radu nr. 9, Sector 2, București" },
    { id: "club_58", name: "ASOCIAȚIA KAMIKAZE OFF ROAD CLUB", cis: "B/A2/00105/2010", cif: "26918364", address: "Str. Jean Louis Calderon nr. 25, Ap. 1, Sector 2, București" },
    { id: "club_59", name: "Asociatia Club Sportiv FIRST MOTORSPORT", cis: "B/A2/00110/2006", cif: "18653983", address: "Str. Ioniță Cegan nr. 5, Bl. P26, Sc. 1, Et. 8, Sector 5, București" },
    { id: "club_60", name: "Asociatia Club Sportiv AVG MOTOR SPORT", cis: "B/A2/00240/2018", cif: "39001680", address: "Prelungirea Ghencea nr. 318B, Sector 6, București" },
    { id: "club_61", name: "Asociatia Club Sportiv RIVAL RACING", cis: "B/A2/00159/2008", cif: "24113104", address: "Str. Moșilor nr. 221, bl. 31A, sc. 2, ap. 43, Sector 2, București" },
    { id: "club_62", name: "Club Sportiv GONETA", cis: "B/A2/00164/2012", cif: "30179162", address: "Șos. Olteniței nr. 40-44, Sector 6, București" },
    { id: "club_63", name: "Asociatia Club Sportiv COLINA MOTORSPORT", cis: "B/A2/00185/2005", cif: "17602167", address: "Șos. Gheorghe Ionescu Sisești nr. 51, parter, Sector 1, București" },
    { id: "club_64", name: "Asociatia Club Sportiv HRT", cis: "B/A2/00208/2002", cif: "14440486", address: "Str. Herăstrău nr. 25, et. P, ap. 1, Sector 1, București" },
    { id: "club_65", name: "Asociatia Club Sportiv OFF ROAD ADVENTURE ROMÂNIA (ORAR)", cis: "B/A2/00231/2010", cif: "26773395", address: "Str. Natației nr. 71, Sector 1, București" },
    { id: "club_66", name: "Asociatia Club Sportiv ROMANIAN DRIFT COMMUNITY", cis: "B/A2/00279/2015", cif: "33303434", address: "Str. Mărășești nr. 61G, Bragadiru, jud. Ilfov" },
    { id: "club_67", name: "Asociatia Club Sportiv RALLY DREAM TEAM BUCUREȘTI", cis: "B/A2/00342/2003", cif: "15677422", address: "Str. Valea Oltului nr. 10, Sector 6, București" },
    { id: "club_68", name: "Club Sportiv PROFESSIONAL RACING", cis: "B/A2/00600/2002", cif: "14566710", address: "Aleea Pravăț nr. 4, Sector 6, București" },
    { id: "club_69", name: "ASOCIAȚIA CLUBUL DE KARTING BUCUREȘTI", cis: "B/A2/00131/2004", cif: "16590200", address: "Aleea Onisifor Ghibu nr. 1, Bl. O28BIS, Sc. 2, Et. 4, Ap. 19, Sector 3, București" },
    { id: "club_70", name: "*Asociatia Club Sportiv ALPHA PEGASUS", cis: "B/A2/00303/2022", cif: "45259936", address: "Str. Ottoi Călin nr. 26, Parter, Sector 2, București" },
    { id: "club_71", name: "Asociatia Club Sportiv ALPHA MOTORSPORT BACĂU", cis: "BC/A2/00128/2023", cif: "47281239", address: "Calea Moldovei nr. 73, Bacău, jud. Bacău, 600352" },
    { id: "club_72", name: "Asociatia Club Sportiv CURIȚA STICLĂRIE", cis: "BC/A2/00143/2020", cif: "42780077", address: "Sat Curița nr. 276, com. Cașin, jud. Bacău" },
    { id: "club_73", name: "Asociatia Club Sportiv SI MOTORSPORT", cis: "BC/A2/00084/2022", cif: "Blank", address: "Blank" },
    { id: "club_74", name: "Asociatia Club Sportiv MEGAFORCE RALLY TEAM BACĂU", cis: "BC/A2/00015/2015", cif: "32616972", address: "Str. Chimiei nr. 1, Et. 1, C3 – Corp Administrativ, Bacău, jud. Bacău" },
    { id: "club_75", name: "Asociatia Club Sportiv RALLY SPIRIT ONEȘTI", cis: "BC/A2/00017/2008", cif: "23094993", address: "Str. Sintezei, Bl. 1, Sc. A, Et. 2, Ap. 5, Onești, jud. Bacău" },
    { id: "club_76", name: "ASOCIAȚIA RIDERS ENDURO CLUB", cis: "BC/A2/00024/2006", cif: "18451933", address: "Str. Principală nr. 557, Oituz, jud. Bacău" },
    { id: "club_77", name: "Asociatia Club Sportiv OFF ROAD DACII LIBERI", cis: "BC/A2/00280/2017", cif: "38634579", address: "Str. Ștefan cel Mare, Bl. 38, Sc. B, Ap. 3, Buhuși, jud. Bacău" },
    { id: "club_78", name: "Asociatia Club Sportiv OFFROAD ZAIG MANIA", cis: "BN/A2/00172/2022", cif: "43948900", address: "Str. Principală nr. 198, Viișoara, mun. Bistrița, jud. Bistrița-Năsăud" },
    { id: "club_79", name: "A.S. CLUBUL ȘO-MO-TO-RACING", cis: "BN/A2/00013/2004", cif: "14091467", address: "Str. Arțarilor nr. 26, Bl. O2, Sc. C, Et. 2, Ap. 52, Bistrița, jud. Bistrița-Năsăud" },
    { id: "club_80", name: "ASOCIAȚIA MOTORSPORT CLUB BRĂILA", cis: "BR/A2/00050/2005", cif: "17398254", address: "Str. Tineretului nr. 38, Brăila, jud. Brăila" },
    { id: "club_81", name: "Asociatia Club Sportiv HOBBY AUTO SPORT BRĂILA", cis: "BR/A2/00099/2019", cif: "10807530", address: "Str. Ana Aslan nr. 21, ap. 1, Brăila, jud. Brăila, 810009" },
    { id: "club_82", name: "Asociatia Club Sportiv AUTO GREEN CLUB BOTOȘANI", cis: "BT/A2/00112/2004", cif: "16305923", address: "Str. Pacea nr. 49, Botoșani, jud. Botoșani, 710135" },
    { id: "club_83", name: "Asociatia Club Sportiv BOTOȘANI AUTORACING CLUB", cis: "BT/A2/00199/2004", cif: "32596077", address: "Str. Marchian nr. 1, Botoșani, jud. Botoșani, 710210" },
    { id: "club_84", name: "Asociatia Club Sportiv ADVENTURE VENETIA", cis: "BV/A2/00018/2023", cif: "47463672", address: "Str. Radu Negru nr. 16, Veneția de Jos, jud. Brașov, 507222" },
    { id: "club_85", name: "Asociatia Club Sportiv ROSENAU RACING", cis: "BV/A2/00279/2021", cif: "43209532", address: "Str. Postăvarului nr. 42, cam. 1, Râșnov, jud. Brașov, 505400" },
    { id: "club_86", name: "A.S.C. AUTO RALLY SPORT BRAȘOV", cis: "BV/A2/00013/2013", cif: "30276688", address: "Str. Mihail Eminescu nr. 42, Săcele, jud. Brașov, 505600" },
    { id: "club_87", name: "Club Sportiv PILOT PROMOTION SPORT", cis: "BV/A2/00016/2006", cif: "14282548", address: "Str. Turnului nr. 5, Brașov, jud. Brașov, 500152" },
    { id: "club_88", name: "Club Sportiv PRORALLY TEAM", cis: "BV/A2/00021/2007", cif: "11546785", address: "Str. 8 Martie nr. 2A, Brașov, jud. Brașov, 500046" },
    { id: "club_89", name: "A. CLUBUL STEPO – CARS BRAȘOV", cis: "BV/A2/00089/2005", cif: "15480381", address: "Str. Mihail Kogălniceanu nr. 20, Bl. 1K, Sc. D, Ap. 21, Brașov, jud. Brașov, 500173" },
    { id: "club_90", name: "Club Sportiv D.T.M. BRAȘOV", cis: "BV/A2/00095/2006", cif: "17797638", address: "Str. Dealul Cetății nr. 61, Brașov, jud. Brașov, 500080" },
    { id: "club_91", name: "A.S.C. TRANS CARPATIC", cis: "BV/A2/00113/2006", cif: "33702435", address: "Str. Popa Tatu nr. 62A, Sector 1, București" },
    { id: "club_92", name: "Asociatia Club Sportiv RACING CARS BRAȘOV", cis: "BV/A2/00218/2013", cif: "31226408", address: "Str. Narciselor nr. 21, Brașov, jud. Brașov" },
    { id: "club_93", name: "Asociatia Club Sportiv AUTO BLIC", cis: "BV/A2/00809/2002", cif: "13993496", address: "Str. Coștila nr. 12C, Brașov, jud. Brașov" },
    { id: "club_94", name: "Asociatia Club Sportiv EDMAR MOTORS", cis: "BV/A2/00055/2005", cif: "17444300", address: "Str. Agrișelor nr. 7, Ap. Cam. 2, Brașov, jud. Brașov" },
    { id: "club_95", name: "Asociatia Club Sportiv F-ATI MOTORSPORT", cis: "BV/A2/00262/2018", cif: "39073393", address: "Str. 11 Iunie 1848 nr. 21, Brașov, jud. Brașov" },
    { id: "club_96", name: "ASOCIAȚIA JUDEȚEANĂ DE AUTOMOBILISM SPORTIV BRAȘOV", cis: "BV/B/00001/2006", cif: "18984391", address: "Str. Nouă nr. 120A, Codlea, jud. Brașov" },
    { id: "club_97", name: "SIM 13 BRAȘOV", cis: "BV/A2/00072/2019", cif: "41798717", address: "Str. Viorelelor nr. 16A, Bl. Camera 1, Colonia Bod, com. Bod, jud. Brașov" },
    { id: "club_98", name: "Asociatia Club Sportiv BUZĂU OFF ROAD ADVENTURE", cis: "BZ/A2/00186/2023", cif: "Blank", address: "Blank" },
    { id: "club_99", name: "AS DE KARTING ELECTRIC CLUJ", cis: "CJ/A2/00184/2022", cif: "46097638", address: "Str. Prof. Ioan Rusu nr. 74B, Florești, jud. Cluj, 400304" },
    { id: "club_100", name: "Club Sportiv HTAG MOTORSPORT", cis: "CJ/A2/00422/2021", cif: "41062728", address: "Șos. București-Târgoviște nr. 236, Camera 2, Crevedia, jud. Dâmbovița" },
    { id: "club_101", name: "ASOCIAȚIA MB MOTORSPORT", cis: "CJ/A2/00086/2020", cif: "42367445", address: "Str. Alverna nr. 77, Et. III, Ap. 13, Cluj-Napoca, jud. Cluj" },
    { id: "club_102", name: "Asociatia Club Sportiv MAS RACING TEAM", cis: "CJ/A2/00453/2021", cif: "42915149", address: "Calea Someșeni nr. 6, Cluj-Napoca, jud. Cluj" },
    { id: "club_103", name: "Asociatia Club Sportiv MGM RACING", cis: "CJ/A2/00098/2021", cif: "43383678", address: "Str. George Valentin Bibescu nr. 14-16, Cluj-Napoca, jud. Cluj" },
    { id: "club_104", name: "Asociatia Club Sportiv WOMEN IN MOTORSPORT", cis: "CJ/A2/00150/2021", cif: "43606508", address: "Str. G-ral Eremia Grigorescu nr. 65, Cluj-Napoca, jud. Cluj" },
    { id: "club_105", name: "Asociatia Club Sportiv NAPOCA OFF-ROAD COMMUNITY (N.O.R.C)", cis: "CJ/A2/00008/2021", cif: "41820741", address: "Str. Traian Vuia nr. 164, Cluj-Napoca, jud. Cluj" },
    { id: "club_106", name: "Asociatia Club Sportiv KNN MOTORSPORT", cis: "CJ/A2/00377/2019", cif: "41349017", address: "Str. Făgetului nr. 5A, Cluj-Napoca, jud. Cluj" },
    { id: "club_107", name: "CLUBUL SPORTIV AUTO MOTO CONTACT", cis: "CJ/A2/00104/2006", cif: "9610703", address: "Str. Constantin Brâncoveanu nr. 52, Cluj-Napoca, jud. Cluj, 400467" },
    { id: "club_108", name: "*Asociatia Club Sportiv NAPOCA RALLY ACADEMY", cis: "CJ/A2/00180/2018", cif: "39089217", address: "Str. Urusagului nr. 16, Bl. C2, Sc. 2, Ap. 16, Florești, jud. Cluj, 407280" },
    { id: "club_109", name: "Asociatia Club Sportiv UDYOFFROADRACING", cis: "CJ/A2/0078/2019", cif: "36839616", address: "Str. Gheorghe Doja nr. FN, Bl. L, Ap. 3, Florești, jud. Cluj" },
    { id: "club_110", name: "Club Sportiv DANNY UNGUR RACING", cis: "CJ/A2/00034/2005", cif: "17207370", address: "Calea Mănăștur nr. 99, Cluj-Napoca, jud. Cluj, 400663" },
    { id: "club_111", name: "Club Sportiv BMP MOTORSPORT", cis: "CJ/A2/00048/2006", cif: "14484547", address: "B-dul 21 Decembrie 1989 nr. 93, Bl. L3, Ap. 16, Cluj-Napoca, jud. Cluj" },
    { id: "club_112", name: "Asociatia Club Sportiv LORI RACING TEAM", cis: "CJ/A2/00053/2006", cif: "18415779", address: "Str. Milcov nr. 19, Ap. 1, Cluj-Napoca, jud. Cluj" },
    { id: "club_113", name: "Asociatia Club Sportiv MOTORHOME NAPOCA RALLY TEAM", cis: "CJ/A2/00079/2007", cif: "21180770", address: "Str. Prof. Nicolae Mărgineanu nr. 37, Cluj-Napoca, jud. Cluj" },
    { id: "club_114", name: "Asociatia Club Sportiv F2 RALLY TEAM", cis: "CJ/A2/00094/2005", cif: "16590250", address: "Str. Viitorului nr. 16, Apahida, jud. Cluj" },
    { id: "club_115", name: "Asociatia Club Sportiv OFF-ROAD TRANSSYLVANIA", cis: "CJ/A2/00111/2010", cif: "15495773", address: "Str. Piezișe nr. 14, Cluj-Napoca, jud. Cluj" },
    { id: "club_116", name: "Club Sportiv SAVU RACING", cis: "CJ/A2/00157/2005", cif: "12277901", address: "Str. G-ral Eremia Grigorescu nr. 65, Cluj-Napoca, jud. Cluj" },
    { id: "club_117", name: "Asociatia Club Sportiv MONSTER RACING TEAM", cis: "CJ/A2/00220/2007", cif: "22459900", address: "P-ța Mihai Viteazu nr. 11-13, Cluj-Napoca, jud. Cluj" },
    { id: "club_118", name: "Asociatia Club Sportiv TTH MOTORSPORT", cis: "CJ/A2/00274/2014", cif: "33362554", address: "Str. Baciului nr. 109, Cluj-Napoca, jud. Cluj" },
    { id: "club_119", name: "Asociatia Club Sportiv OFF ROAD RESITA", cis: "CS/A2/00112/2023", cif: "47252373", address: "Str. Principală nr. C.682, Văliug, jud. Caraș-Severin" },
    { id: "club_120", name: "A.C. ACM SPORT", cis: "CS/A2/00258/2011", cif: "49103408", address: "Str. Veseliei nr. 5, Chiajna, jud. Ilfov" },
    { id: "club_121", name: "Asociatia Club Sportiv THETIS", cis: "CT/A2/00299/2022", cif: "45784668", address: "Str. Remus Opreanu nr. 12A, Camera 2, Bl. L2, Sc. D, Et. 3, Ap. 39, Constanța, jud. Constanța" },
    { id: "club_122", name: "Asociatia Club Sportiv AUTO SPEED MANGALIA", cis: "CT/A2/00097/2020", cif: "40827768", address: "Str. Mihai Viteazu nr. 54B, Cam. 1, Mangalia, jud. Constanța" },
    { id: "club_123", name: "Asociatia Club Sportiv 4V MOTORSPORT", cis: "CT/A2/00064/2020", cif: "42048276", address: "Str. Revoluției din 22 Decembrie 1989 nr. L12, Et. Parter, Librăria 38, Camera 1, Constanța, jud. Constanța" },
    { id: "club_124", name: "Asociatia Club Sportiv RH MOTORSPORT", cis: "CV/A2/00219/2020", cif: "42560615", address: "Str. Lt. Păiș David nr. 9, Sfântu Gheorghe, jud. Covasna, 520077" },
    { id: "club_125", name: "CLUBUL AUTO CRONO CV", cis: "CV/A2/00062/2004", cif: "9618480", address: "Str. Livezii nr. 3, Sfântu Gheorghe, jud. Covasna, 520031" },
    { id: "club_126", name: "Asociatia Club Sportiv AUTO VALAHIA", cis: "DB/A2/00417/2021", cif: "45533828", address: "Str. Principală nr. 27, Valea Mare, jud. Dâmbovița" },
    { id: "club_127", name: "Asociatia Club Sportiv ASV MOTORSPORT", cis: "DB/A2/00321/2017", cif: "37176503", address: "Str. Ion Ghica nr. 5, Bl. 7, Sc. A, Et. 6, Ap. 25, Târgoviște, jud. Dâmbovița" },
    { id: "club_128", name: "Asociatia Club Sportiv OLTENIA RACING", cis: "DJ/A2/00136/2019", cif: "39356136", address: "Str. Nicolae Titulescu nr. 90, Bl. 27, Sc. 1, Ap. 1, Craiova, jud. Dolj" },
    { id: "club_129", name: "Asociatia Club Sportiv RAIDERI", cis: "GJ/A2/00020/2016", cif: "35056233", address: "Str. Ecaterina Teodoroiu nr. 38A, Bl. 38A, Sc. 4, Ap. 2, Târgu Jiu, jud. Gorj" },
    { id: "club_130", name: "Asociatia Club Sportiv AUTOCOREX TG-JIU", cis: "GJ/A2/00075/2006", cif: "11676084", address: "Str. Constantin Brâncuși nr. 27, Târgu Jiu, jud. Gorj" },
    { id: "club_131", name: "A.C.S OFF ROAD VAȚA", cis: "HD/A2/00479/2023", cif: "48730573", address: "Str. Decebal nr. 62, Brad, jud. Hunedoara" },
    { id: "club_132", name: "Club Sportiv AMC RACING", cis: "HD/A2/00098/2007", cif: "21596926", address: "B-dul 1 Decembrie 1918 nr. FN, Bl. A, Et. Parter, Deva, jud. Hunedoara" },
    { id: "club_133", name: "Asociatia Club Sportiv OFF-ROAD DEVA", cis: "HD/A2/00268/2020", cif: "42454290", address: "Str. Decebal nr. 20, Bl. 15, Sc. 1, Et. 4, Ap. 50, Deva, jud. Hunedoara" },
    { id: "club_134", name: "Asociatia Club Sportiv TRAVEL 4×4 ORĂȘTIE", cis: "HD/A2/00138/2019", cif: "38654843", address: "Str. Căstăului nr. 77, Orăștie, jud. Hunedoara" },
    { id: "club_135", name: "Asociatia Club Sportiv AUTO MOTO RETEZAT", cis: "HD/A2/00024/2020", cif: "Blank", address: "Blank" },
    { id: "club_136", name: "CLUB OFF ROAD BRAD", cis: "HD/A2/00148/2019", cif: "40726160", address: "Str. Decebal nr. 20, Brad, jud. Hunedoara" },
    { id: "club_137", name: "Asociatia Club Sportiv VIDI TOP SPORT", cis: "HD/A2/00024/2011", cif: "26876277", address: "Str. Ardealului nr. 1, Deva, jud. Hunedoara" },
    { id: "club_138", name: "Asociatia Club Sportiv HD MOTOR SPORT", cis: "HD/A2/00190/2017", cif: "37388930", address: "Str. Minerului nr. FN, Bl. 23, Sc. C, Et. 2, Ap. 51, Deva, jud. Hunedoara" },
    { id: "club_139", name: "C..S. BUDAI RALLY TEAM", cis: "HD/A2/00354/2017", cif: "29601688", address: "Str. George Enescu nr. 16, Bl. 110, Sc. A, Et. 3, Ap. 19, Hunedoara, jud. Hunedoara" },
    { id: "club_140", name: "Asociatia Club Sportiv HARGHITA RACING TEAM", cis: "HR/A2/00168/2019", cif: "39521659", address: "Str. Florilor nr. FN, Bl. 21, Sc. C, Ap. 48, Gheorgheni, jud. Harghita" },
    { id: "club_141", name: "Club Sportiv MAXX RACING", cis: "HR/A2/00053/2011", cif: "13826773", address: "Str. Kós Károly nr. 1, Odorheiu Secuiesc, jud. Harghita" },
    { id: "club_142", name: "AUTO CLUB PRO MOTOR HARGHITA", cis: "HR/A2/00688/2002", cif: "Blank", address: "Blank" },
    { id: "club_143", name: "Asociatia Club Sportiv OFF ROAD CIUC", cis: "HR/A2/00213/2018", cif: "38050022", address: "Str. Principală nr. 777/A, Ap. 18, Sâncrăieni, jud. Harghita" },
    { id: "club_144", name: "A.C.S RIK MOTORSPORT", cis: "IF/A2/00495/2024", cif: "50639303", address: "Str. Aviator Adrian Iovan nr. 34, Otopeni, jud. Ilfov" },
    { id: "club_145", name: "A.C.S GHERGHESCU MOTORSPORT", cis: "IF/A2/00114/2024", cif: "30085599", address: "Str. Salcâmilor nr. 4K, Cornetu, jud. Ilfov" },
    { id: "club_146", name: "ASOCIATIA CLUBUL SPORTIV FALCO RACING", cis: "IF/A2/00061/2024", cif: "47878521", address: "Str. 1 Decembrie 1918 nr. 199, Camera 1, Dărăști-Ilfov, jud. Ilfov" },
    { id: "club_147", name: "A.C.S E-CO TEAM MOTORSPORT", cis: "IF/A2/00398/2023", cif: "47435893", address: "Str. Dunării nr. 146-148, Bl. B1-01, Et. 2, Ap. 24, Bragadiru, jud. Ilfov" },
    { id: "club_148", name: "Asociatia Club Sportiv ALFA GARAJ CLASIC", cis: "IF/A2/00109/2023", cif: "46382324", address: "Str. Răsăritului nr. 7, Cornetu, jud. Ilfov" },
    { id: "club_149", name: "Asociatia Club Sportiv NOMAD FORMULA", cis: "IF/A2/00013/2023", cif: "47483394", address: "Str. Pădurii nr. 1B, Tunari, jud. Ilfov" },
    { id: "club_150", name: "Asociatia Club Sportiv C.H.A.T MOTORSPORT", cis: "IF/A2/00271/2022", cif: "46375335", address: "Str. Rahovei nr. 50, Bragadiru, jud. Ilfov" },
    { id: "club_151", name: "Asociatia Club Sportiv LUCA MOTORSPORT", cis: "IF/A2/00016/2022", cif: "45084222", address: "Str. Emil Racoviță nr. 27C, Et. Parter, Ap. 3, Voluntari, jud. Ilfov" },
    { id: "club_152", name: "Asociatia Club Sportiv CHRONORALLY", cis: "IF/A2/00053/2022", cif: "45278563", address: "Str. Institutului nr. 9, Ap. Camera 2, Petrești, jud. Ilfov" },
    { id: "club_153", name: "Asociatia Club Sportiv ROMANIAN RETRO RACING", cis: "IF/A2/00066/2010", cif: "26590835", address: "Str. Agromec nr. 7, Zona 1, Hala 21, Moara Vlăsiei, jud. Ilfov" },
    { id: "club_154", name: "Asociatia Club Sportiv NESTOR MOTORSPORT", cis: "IF/A2/00159/2020", cif: "43079394", address: "Str. Iris nr. 17, Balotești, jud. Ilfov" },
    { id: "club_155", name: "Asociatia Club Sportiv APEX MIREA MOTORSPORT", cis: "IF/A2/00060/2020", cif: "42362596", address: "Aleea Lacului nr. 14, Dobroești, jud. Ilfov" },
    { id: "club_156", name: "Asociatia Club Sportiv BLITZWOLF RACING", cis: "IF/A2/00031/2020", cif: "41885864", address: "Str. I.C. Brătianu nr. 3-5, Et. 3, Biroul nr. 15, Chitila, jud. Ilfov" },
    { id: "club_157", name: "Asociatia Club Sportiv MVM RALLY MOTORSPORT", cis: "IF/A2/00110/2020", cif: "42520904", address: "Str. 23 August nr. 93, Bl. 2, Et. 1, Ap. 23, Otopeni, jud. Ilfov" },
    { id: "club_158", name: "Asociatia Club Sportiv SSV POWER SPORT", cis: "IF/A2/00044/2020", cif: "42423740", address: "Str. I.L. Caragiale nr. 72A, Bl. 1, Sc. B, Et. 6, Ap. 76, Dudu, jud. Ilfov" },
    { id: "club_159", name: "Asociatia Club Sportiv DADI-VIZ RACING", cis: "IF/A2/00302/2018", cif: "39727501", address: "Str. Milcov nr. 31A, Et. Parter, Camera 2, Măgurele, jud. Ilfov" },
    { id: "club_160", name: "Asociatia Club Sportiv GTC MOTORSPORT", cis: "IF/A2/00106/2012", cif: "29982418", address: "Str. Sf. Nicolae nr. 4C, Popești-Leordeni, jud. Ilfov" },
    { id: "club_161", name: "Club Sportiv TOP CROSS T.C.S", cis: "IF/A2/00192/2003", cif: "15315627", address: "Str. Traian nr. 20, Otopeni, jud. Ilfov" },
    { id: "club_162", name: "Asociatia Club Sportiv AT MOTORSPORT", cis: "IF/A2/00402/2019", cif: "40740164", address: "Str. Lahovari nr. 89/24, Dumbrăveni, com. Balotești, jud. Ilfov" },
    { id: "club_163", name: "ASOCIAȚIA INSOMNIA RACING CLUB", cis: "IF/A2/00313/2005", cif: "18400409", address: "Bld. Mihai Eminescu nr. 26, Buftea, jud. Ilfov" },
    { id: "club_164", name: "ASOCIAȚIA RADAR CLUB IAȘI", cis: "IS/A2/00602/2024", cif: "47745142", address: "Str. Editurii nr. 65, Sc. A, Ap. 10, Mansardă, Lunca Cetățuii, jud. Iași" },
    { id: "club_165", name: "Club Sportiv OFFROAD CLUB", cis: "IS/A2/00104/2010", cif: "26423438", address: "Str. Negoi nr. 30, Sibiu, jud. Sibiu" },
    { id: "club_166", name: "ASOCIAȚIA. XS MOTOR SPORT", cis: "IS/A2/00296/2013", cif: "31651602", address: "Aleea Mihail Sadoveanu nr. 28, Bl. A5, Iași, jud. Iași" },
    { id: "club_167", name: "Asociatia Club Sportiv ADVENTURE 4X4 IAȘI", cis: "IS/A2/00334/2013", cif: "30997293", address: "Str. Principală nr. FN, Corp C2-Hala, Tomești, jud. Iași" },
    { id: "club_168", name: "*Asociatia Club Sportiv PHILADELPHIA MOTORSPORT", cis: "MH/A2/00061/2023", cif: "47798430", address: "Str. Principală nr. FN, Lunca Cosara, Dubova, jud. Mehedinți" },
    { id: "club_169", name: "A.C.S DR.BROWN’S", cis: "MM/A2/00341/2022", cif: "Blank", address: "Blank" },
    { id: "club_170", name: "Asociatia Club Sportiv ALR SPORT ACADEMY", cis: "MM/A2/00057/2022", cif: "45385675", address: "Str. Dragoș Vodă nr. 113, Baia Sprie, jud. Maramureș" },
    { id: "club_171", name: "Club Sportiv 4X4 OFF-ROAD SEINI", cis: "MM/42/00251/2021", cif: "31268101", address: "Str. Piața Unirii nr. 14, Seini, jud. Maramureș" },
    { id: "club_172", name: "Asociatia Club Sportiv AVENTURA PE TEREN ACCIDENTAT", cis: "MM/A2/00199/2021", cif: "43078151", address: "Str. Principală nr. 218A, Rus, jud. Maramureș" },
    { id: "club_173", name: "Asociatia Club Sportiv XPO RACING", cis: "MM/A2/00280/2019", cif: "36194730", address: "Str. Țebea nr. 16A, Baia Mare, jud. Maramureș" },
    { id: "club_174", name: "Asociatia Club Sportiv XTREME ADVENTURE", cis: "MM/A2/00186/2006", cif: "18569425", address: "Bld. Regele Mihai I nr. 55, Baia Mare, jud. Maramureș" },
    { id: "club_175", name: "Club Sportiv MINAUR BAIA MARE", cis: "MM/A1/00009/2015", cif: "Blank", address: "Blank" },
    { id: "club_176", name: "Asociatia Club Sportiv MNP RACING", cis: "MS/A2/00087/2022", cif: "43771408", address: "Str. Mureșeni nr. 50, Târgu Mureș, jud. Mureș" },
    { id: "club_177", name: "Asociatia Club Sportiv VALEA REGILOR OFF ROAD TEAM", cis: "MS/A2/00008/2022", cif: "44311505", address: "Str. Mureșului nr. 2, Sc. 1, Ap. 11, Sângeorgiu de Mureș, jud. Mureș" },
    { id: "club_178", name: "Asociatia Club Sportiv MUREȘ RALLY TEAM", cis: "MS/A2/00395/2019", cif: "32479581", address: "Str. Bărăganului nr. 55, Târgu Mureș, jud. Mureș" },
    { id: "club_179", name: "Club Sportiv MUNICIPAL TG. MUREȘ", cis: "MS/A1/00014/2018", cif: "44463821", address: "Str. Mioriței nr. 19, Târgu Mureș, jud. Mureș" },
    { id: "club_180", name: "Asociatia Club Sportiv RACING TEAM SIGHIȘOARA", cis: "MS/A2/00283/2019", cif: "41069920", address: "Aleea Teilor nr. 1, Sighișoara, jud. Mureș" },
    { id: "club_181", name: "Asociatia Club Sportiv 4X4 SIGHIȘOARA", cis: "MS/A2/00094/2019", cif: "40401141", address: "Str. Vasile Lucaciu nr. 26, Sighișoara, jud. Mureș" },
    { id: "club_182", name: "ASOCIAȚIA C.O.R.P.-CLUB OFF ROAD", cis: "NT/A2/00132/2015", cif: "33662390", address: "Str. Uzinei nr. 6, Săvinești, jud. Neamț" },
    { id: "club_183", name: "*A.C. DE KARTING ELECTRIC PLOIEȘTI", cis: "PH/A2/00230/2021", cif: "44620373", address: "Str. Libertății nr. 5, Bl. 32D, Et. 3, Ap. 15, Ploiești, jud. Prahova" },
    { id: "club_184", name: "Asociatia Club Sportiv SNOWLINE", cis: "PH/A2/00218/2022", cif: "40236982", address: "Str. Clăbucet nr. 2, Azuga, jud. Prahova" },
    { id: "club_185", name: "Club Sportiv MOTORS HOUSE", cis: "PH/A2/00132/2021", cif: "43935322", address: "Str. Liliacului nr. 20, Câmpina, jud. Prahova" },
    { id: "club_186", name: "Asociatia Club Sportiv DELANOI MOTOR SPORT", cis: "PH/A2/00335/2021", cif: "44647166", address: "Str. Democrației nr. 98, Bl. E, Sc. B, Et. 3, Ap. 35, Ploiești, jud. Prahova" },
    { id: "club_187", name: "Club Sportiv CARPAȚI SINAIA", cis: "PH/A1/00019/2006", cif: "42868276", address: "Str. Badea Cârțan nr. 9, Bl. 18, Sc. A, Et. 3, Ap. 18, Sinaia, jud. Prahova" },
    { id: "club_188", name: "Asociatia Club Sportiv LEADERS R US", cis: "PH/A2/00128/2015", cif: "32915532", address: "Str. Stânjeneilor nr. 2, Bl. 2, Ap. 5, Sinaia, jud. Prahova" },
    { id: "club_189", name: "Asociatia Club Sportiv DRAG RACING EVENTS", cis: "PH/A2/00239/2017", cif: "28403534", address: "Str. Cezar Bolliac nr. 25, Ploiești, jud. Prahova" },
    { id: "club_190", name: "A.C.S ANDREI MOTORSPORT SIBIU", cis: "SB/A2/00076/2025", cif: "51219880", address: "Str. Teilor nr. 57, Sibiu, jud. Sibiu" },
    { id: "club_191", name: "A.C.S LUCA MOTORSPORT SIBIU 2024", cis: "SB/A2/00084/2025", cif: "51363213", address: "Str. Principală nr. FN, CF nr. 100904 nr. top. 423/1/3/1/1/4, Șura Mare, jud. Sibiu" },
    { id: "club_192", name: "A.C.S NOAH RALLY TEAM", cis: "SB/A2/00283/2023", cif: "46254317", address: "Str. Henri Coandă nr. 12, Sibiu, jud. Sibiu" },
    { id: "club_193", name: "*Asociatia Club Sportiv GDS RACING SIBIU", cis: "SB/A2/00114/2022", cif: "45159260", address: "Str. Doamna Stanca nr. 9, Șelimbăr, jud. Sibiu" },
    { id: "club_194", name: "Asociatia Club Sportiv TUNING RALLY TEAM", cis: "SB/A2/00307/2021", cif: "40892952", address: "Str. Nouă nr. 5, Șelimbăr, jud. Sibiu" },
    { id: "club_195", name: "Asociatia Club Sportiv DE AUTOMOBILISM SIBIU", cis: "SB/A2/00265/2008", cif: "24609346", address: "Str. După Grădini nr. 433, Șura Mare, jud. Sibiu" },
    { id: "club_196", name: "Asociatia Club Sportiv MOTORSPORT SIBIU", cis: "SB/A2/00021/2021", cif: "43253317", address: "Piața Tălmaciu nr. 14, Sibiu, jud. Sibiu" },
    { id: "club_197", name: "Club Sportiv PRO DRIVE SIBIU", cis: "SB/A2/00016/2009", cif: "21179376", address: "Str. Măgura nr. 6, Sibiu, jud. Sibiu" },
    { id: "club_198", name: "Asociatia Club Sportiv ARIA PENTRU SPORT", cis: "SB/A2/00084/2015", cif: "34099880", address: "Șoseaua Alba Iulia nr. 100, Sibiu, jud. Sibiu" },
    { id: "club_199", name: "Asociatia Club Sportiv SERA", cis: "SB/A2/00202/2006", cif: "19085610", address: "Șoseaua Alba Iulia nr. 110, Sibiu, jud. Sibiu" },
    { id: "club_200", name: "Asociatia Club Sportiv G. BADEA RALLY TEAM", cis: "SB/A2/00204/2017", cif: "36665153", address: "Aleea Pădurii nr. 6, Șelimbăr, jud. Sibiu" },
    { id: "club_201", name: "Asociatia Club Sportiv PERFORMANCE", cis: "SB/A2/00207/2005", cif: "39349244", address: "Str. Filaret Barbu nr. 15, Timișoara, jud. Timiș" },
    { id: "club_202", name: "Asociatia Club Sportiv SIBIU RALLY TEAM", cis: "SB/A2/00273/2008", cif: "24560757", address: "Str. Islazului nr. 21, Sibiu, jud. Sibiu" },
    { id: "club_203", name: "Asociatia Club Sportiv RAUL BADIU RACING", cis: "SB/A2/00352/2017", cif: "37152970", address: "Str. Constructorilor nr. 38, Sibiu, jud. Sibiu" },
    { id: "club_204", name: "Club Sportiv MUNICIPAL MEDIAȘ", cis: "SB/A1/00022/2017", cif: "38045310", address: "Str. Lotru nr. 3, Mediaș, jud. Sibiu" },
    { id: "club_205", name: "Club Sportiv SIBIU RACING TEAM", cis: "SB/A2/00027/2015", cif: "33913505", address: "Str. Teilor nr. 5, Sibiu, jud. Sibiu" },
    { id: "club_206", name: "Asociatia Club Sportiv NSM MOTORSPORT", cis: "SM/A2/00115/2007", cif: "21512488", address: "Str. Principală nr. 251, Dorolț, jud. Satu Mare" },
    { id: "club_207", name: "*Asociatia Club Sportiv OFF ROAD MAX", cis: "SV/A2/00219/2023", cif: "48226798", address: "Str. Humorului nr. 105, Șcheia, jud. Suceava" },
    { id: "club_208", name: "Asociatia Club Sportiv BUCOVINA TEAM MOTORSPORT", cis: "SV/A2/00119/2023", cif: "Blank", address: "Blank" },
    { id: "club_209", name: "Asociatia Club Sportiv BUCOVINA 4X4", cis: "SV/A2/00086/2022", cif: "42960778", address: "Str. Principală nr. 68, Șaru Dornei, jud. Suceava" },
    { id: "club_210", name: "*A. C. S. MOTORSPORT LUGOJ", cis: "TM/A2/00296/2023", cif: "44579746", address: "Str. Huniade nr. 6, Bl. 3/B, Sc. A, Ap. 18, Lugoj, jud. Timiș" },
    { id: "club_211", name: "A.C.S CANOVA RACING", cis: "TM/A2/00456/2023", cif: "RO49159689", address: "Str. Aristide Demetriade nr. 1-5, Timișoara, jud. Timiș" },
    { id: "club_212", name: "ASOCIAȚIA AUTO CLUB RALLY TIMIȘ", cis: "TM/A2/00291/2013", cif: "31289457", address: "Str. Ionel Perlea nr. 3, Sc. B, Ap. 7, Camera 1, Timișoara, jud. Timiș" },
    { id: "club_213", name: "Asociatia Club Sportiv MIHOC RALLY TEAM", cis: "TM/A2/00324/2021", cif: "41994004", address: "Str. Orizont nr. 7, Moșnița Nouă, jud. Timiș, cod poștal 307285" },
    { id: "club_214", name: "Asociatia Club Sportiv REPSOL RACING TIMIȘOARA", cis: "TM/A2/00101/2020", cif: "41821810", address: "Str. Muncitorilor nr. 29A, Giroc, jud. Timiș, cod poștal 307220" },
    { id: "club_215", name: "Asociatia Club Sportiv GAO RACING TEAM TIMIȘOARA", cis: "TM/A2/00060/2012", cif: "29358245", address: "Str. Mareșal Constantin Prezan nr. 77, et. II, ap. 12, Timișoara, jud. Timiș" },
    { id: "club_216", name: "Club Sportiv ALEXANDRU BORLOVAN ALIAS SANDY", cis: "TM/A2/00064/2010", cif: "26564534", address: "Str. Telegrafului nr. 35, ap. 2, Timișoara, jud. Timiș, cod poștal 300135" },
    { id: "club_217", name: "Asociatia Club Sportiv BSSR AUTOMOTOSPORT", cis: "TM/A2/00184/2013", cif: "29421504", address: "Str. Dositej Obradović nr. 4, sc. A, et. 4, ap. 19, Timișoara, jud. Timiș, cod poștal 300729" },
    { id: "club_218", name: "Asociatia Club Sportiv E.P. RACING", cis: "TM/A2/00198/2016", cif: "31963078", address: "Str. XII nr. 43, Șag, jud. Timiș" },
    { id: "club_219", name: "Asociatia Club Sportiv C.B. RALLY VEST", cis: "TM/A2/00241/2012", cif: "30948185", address: "Str. Constructorilor nr. 26, et. parter, ap. 1, Timișoara, jud. Timiș" },
    { id: "club_220", name: "Asociatia Club Sportiv KREPELKA MOTORSPORT", cis: "TM/A2/00295/2014", cif: "41062728", address: "Șos. București-Târgoviște nr. 236, Camera 2, Crevedia, jud. Dâmbovița" },
    { id: "club_221", name: "Asociatia Club Sportiv PRO TIMIȘ", cis: "TM/A2/00209/2017", cif: "37053934", address: "Str. Amforei nr. 10, Sc. A, Et. 6, Timișoara, jud. Timiș" },
    { id: "club_222", name: "Asociatia Club Sportiv DANIELA ZAHARIE", cis: "TM/A2/00017/2018", cif: "31419727", address: "Str. Izlaz nr. FN, Bl. 51, Sc. B, Et. 4, Ap. 17, Timișoara, jud. Timiș" },
    { id: "club_223", name: "Club Sportiv NEOMOTORSPORT", cis: "VL/A2/00465/2023", cif: "Blank", address: "Blank" },
    { id: "club_224", name: "Asociatia Club Sportiv BDM MOTORSPORT", cis: "VL/A2/00172/2021", cif: "34087428", address: "Str. Tudor Vladimirescu nr. 9A, Horezu, jud. Vâlcea" },
    { id: "club_225", name: "PALATUL COPIILOR RÂMNICU VÂLCEA", cis: "VL/A1/00008/2007", cif: "Blank", address: "Scuarul Mircea cel Bătrân nr. 3, Râmnicu Vâlcea, jud. Vâlcea" },
    { id: "club_226", name: "Asociatia Club Sportiv X3M VÂLCEA", cis: "VL/A2/00041/2011", cif: "27765811", address: "Calea București nr. 70, Râmnicu Vâlcea, jud. Vâlcea" },
    { id: "club_227", name: "Asociatia Club Sportiv TURBOSFAX", cis: "VL/A2/00264/2005", cif: "13441653", address: "Str. Râureni nr. 34, Râmnicu Vâlcea, jud. Vâlcea" },
    { id: "club_228", name: "Asociatia Club Sportiv OFF-ROAD MOBILZONE 4X4", cis: "VS/A2/00038/2022", cif: "45579680", address: "Str. Palermo nr. 4, Bârlad, jud. Vaslui" },
    { id: "club_229", name: "Asociatia Club Sportiv BÂRLAD OFF ROAD", cis: "VS/A2/00464/2021", cif: "45512132", address: "Bld. Republicii nr. 113, Bârlad, jud. Vaslui" },
    { id: "club_230", name: "Club Sportiv PRODRIVE BÂRLAD", cis: "VS/A2/00336/2005", cif: "14457860", address: "Fdt. I Ion Roată nr. 60, Bârlad, jud. Vaslui" }
];


export const competitors: Competitor[] = [
  { id: 'comp_001', name: 'Sébastien Loeb', team: 'M-Sport Ford', country: 'FR', avatar: 'https://i.pravatar.cc/150?u=sebastienloeb', vehicle: 'Ford Puma Rally1' },
  { id: 'comp_002', name: 'Kalle Rovanperä', team: 'Toyota Gazoo Racing', country: 'FI', avatar: 'https://i.pravatar.cc/150?u=kallerovanpera', vehicle: 'Toyota GR Yaris Rally1' },
  { id: 'comp_003', name: 'Ott Tänak', team: 'Hyundai Motorsport', country: 'EE', avatar: 'https://i.pravatar.cc/150?u=otttanak', vehicle: 'Hyundai i20 N Rally1' },
  { id: 'comp_004', name: 'Thierry Neuville', team: 'Hyundai Motorsport', country: 'BE', avatar: 'https://i.pravatar.cc/150?u=thierryneuville', vehicle: 'Hyundai i20 N Rally1' },
  { id: 'comp_005', name: 'Elfyn Evans', team: 'Toyota Gazoo Racing', country: 'GB', avatar: 'https://i.pravatar.cc/150?u=elfynevans', vehicle: 'Toyota GR Yaris Rally1' },
  { id: 'comp_006', name: 'Takamoto Katsuta', team: 'Toyota Gazoo Racing NG', country: 'JP', avatar: 'https://i.pravatar.cc/150?u=takamotokatsuta', vehicle: 'Toyota GR Yaris Rally1' },
];

export const stages: Stage[] = [
  { id: 'stg_01', name: 'Col de Turini', location: 'Monte Carlo', distance: 15.31, status: 'completed' },
  { id: 'stg_02', name: 'Ouninpohja', location: 'Finland', distance: 33.00, status: 'completed' },
  { id: 'stg_03', name: 'El Chocolate', location: 'Mexico', distance: 31.45, status: 'live' },
  { id: 'stg_04', name: 'Myherin', location: 'Wales', distance: 29.13, status: 'upcoming' },
  { id: 'stg_05', 'name': 'Fafe', 'location': 'Portugal', 'distance': 11.18, 'status': 'upcoming' },
];

export const newsPosts: NewsPost[] = [
  { id: 'post_01', title: 'Rally Starts Tomorrow!', content: 'The first stage kicks off tomorrow morning at 8:00 AM sharp. Get ready for an adrenaline-fueled weekend!', author: 'Rally Control', timestamp: '2024-07-19T18:00:00Z', type: 'event' },
  { id: 'post_02', title: 'System Maintenance', content: 'The live timing system will be undergoing scheduled maintenance tonight from 1:00 AM to 2:00 AM.', author: 'Admin', timestamp: '2024-07-19T14:30:00Z', type: 'system' },
  { id: 'post_03', title: 'Stage 2 Results Are In', content: 'Kalle Rovanperä takes the lead after a blistering run through the legendary Ouninpohja stage. Full results are now on the leaderboard.', author: 'Rally Control', timestamp: '2024-07-20T12:00:00Z', type: 'event' },
];

export const leaderboard: LeaderboardEntry[] = [
    { rank: 1, competitor: competitors[1], totalTime: "1:15:34.2", stageTimes: [{ stageId: 'stg_01', time: '08:12.5' }, { stageId: 'stg_02', time: '15:30.1' }] },
    { rank: 2, competitor: competitors[0], totalTime: "1:15:45.8", stageTimes: [{ stageId: 'stg_01', time: '08:10.1' }, { stageId: 'stg_02', time: '15:42.2' }] },
    { rank: 3, competitor: competitors[2], totalTime: "1:16:01.0", stageTimes: [{ stageId: 'stg_01', time: '08:20.3' }, { stageId: 'stg_02', time: '15:35.5' }] },
    { rank: 4, competitor: competitors[3], totalTime: "1:16:12.5", stageTimes: [{ stageId: 'stg_01', time: '08:25.0' }, { stageId: 'stg_02', time: '15:40.3' }] },
];

    
import { useState, useEffect, useRef, useCallback } from 'react'
import { sb, dbGetProducts, dbUpsertProduct, dbDeleteProduct, dbGetOrders, dbInsertOrder,
  dbGetSettings, dbSaveSettings, dbGetPush, dbAddPush, dbGetUsers, dbUpsertUser, dbTrackVisitor,
  getVisitorId, getSavedPhone, savePhone, getSavedName, saveName,
  getSavedCart, saveCart, getSavedDelivery, saveDelivery, getSavedAddr, saveAddr,
  ls, lsSet } from './db.js'

// ─── ВСЕ 227 ТОВАРОВ ───
const ALL_PRODUCTS = [
  {id:'00892',name:'АКБ 3000mah-18650 HG2 🤎',brand:'АКБ',cat:'АКБ',price:350,sku:'00892',emoji:'🔋',photo:''},
  {id:'929811',name:'АКБ LG 2500mAh-18.650 HE4',brand:'АКБ',cat:'АКБ',price:330,sku:'929811',emoji:'🔋',photo:''},
  {id:'929463',name:'АКБ SONY 3000mah 18650VTC6',brand:'АКБ',cat:'АКБ',price:350,sku:'929463',emoji:'🔋',photo:''},
  {id:'929838',name:'UFORCE-L TANK (бак+испаритель+койла)',brand:'Бак/Койла',cat:'Баки и стекло',price:1500,sku:'929838',emoji:'💨',photo:''},
  {id:'929862',name:'БАК UFORCE-X TANK PNP 5.5ml',brand:'Бак/Койла',cat:'Баки и стекло',price:1500,sku:'929862',emoji:'💨',photo:''},
  {id:'929860',name:'БАК Z FLI TANK 2 5.5ml',brand:'Бак/Койла',cat:'Баки и стекло',price:1700,sku:'929860',emoji:'💨',photo:''},
  {id:'929861',name:'БАК Z NANO MTL Tank 4ml',brand:'Бак/Койла',cat:'Баки и стекло',price:1550,sku:'929861',emoji:'💨',photo:''},
  {id:'929548',name:'Бак GEEKVAPE Z nano MTL Tank',brand:'Geekvape',cat:'Баки и стекло',price:1350,sku:'929548',emoji:'💨',photo:''},
  {id:'929568',name:'БАК KNIGHT 80 картридж',brand:'Smoant',cat:'Баки и стекло',price:630,sku:'929568',emoji:'💨',photo:''},
  {id:'929696',name:'БАК / КАРТРИДЖ PASITO 3',brand:'Smoant',cat:'Баки и стекло',price:320,sku:'929696',emoji:'💨',photo:''},
  {id:'929940',name:'Бак Knight aio',brand:'Smoant',cat:'Баки и стекло',price:300,sku:'929940',emoji:'💨',photo:''},
  {id:'929649',name:'DUFT 5% (10 вкусов)',brand:'DUFT',cat:'Бюджетные жидкости',price:100,sku:'929649',emoji:'🧴',photo:''},
  {id:'929598',name:'HUSKY STRONG (копия)',brand:'HUSKY',cat:'Бюджетные жидкости',price:120,sku:'929598',emoji:'🧴',photo:''},
  {id:'929851',name:'MALASIAN GOLD 10мл 60mg (10 вкусов)',brand:'MALASIAN GOLD',cat:'Бюджетные жидкости',price:110,sku:'929851',emoji:'🧴',photo:''},
  {id:'929910',name:'ADVENTURE TIME 70mg strong (10 вкусов)',brand:'ADVENTURE TIME',cat:'Жидкости Premium',price:240,sku:'929910',emoji:'🌀',photo:''},
  {id:'929516',name:'BRYZGI 2/5% (50 вкусов)',brand:'BRYZGI',cat:'Жидкости Premium',price:195,sku:'929516',emoji:'💦',photo:''},
  {id:'929901',name:'CATSTRIP MEDIUM 15 вкусов 28%',brand:'CATSTRIP',cat:'Жидкости Premium',price:230,sku:'929901',emoji:'🐱',photo:''},
  {id:'929494',name:'CATSWILL EXTRA 20hard',brand:'CATSWILL',cat:'Жидкости Premium',price:250,sku:'929494',emoji:'🐾',photo:''},
  {id:'929685',name:'CATSWILL PREMIUM 20mg',brand:'CATSWILL',cat:'Жидкости Premium',price:295,sku:'929685',emoji:'🐾',photo:''},
  {id:'929885',name:'CHILLER SALT (9 вкусов)',brand:'CHILLER',cat:'Жидкости Premium',price:170,sku:'929885',emoji:'❄️',photo:''},
  {id:'00477',name:'CHROME BASIC 2/5%',brand:'CHROME',cat:'Жидкости Premium',price:260,sku:'00477',emoji:'⚡',photo:''},
  {id:'00478',name:'CHROME NORTH 2/5%',brand:'CHROME',cat:'Жидкости Premium',price:260,sku:'00478',emoji:'⚡',photo:''},
  {id:'00736',name:'CHROME PINK 2/5%',brand:'CHROME',cat:'Жидкости Premium',price:265,sku:'00736',emoji:'⚡',photo:''},
  {id:'929871',name:'DOTA CATS 60mg',brand:'DOTA',cat:'Жидкости Premium',price:250,sku:'929871',emoji:'🎮',photo:''},
  {id:'929749',name:'DUALL EXTREME',brand:'DUALL',cat:'Жидкости Premium',price:245,sku:'929749',emoji:'🔥',photo:''},
  {id:'929913',name:'DUALL NICBAR 50000 puff',brand:'DUALL',cat:'Жидкости Premium',price:790,sku:'929913',emoji:'🔥',photo:''},
  {id:'929688',name:'DUALL SALT 2/5% (38 вкусов)',brand:'DUALL',cat:'Жидкости Premium',price:235,sku:'929688',emoji:'🔥',photo:''},
  {id:'929907',name:'FUMO PREMIUM 2/5%',brand:'FUMO',cat:'Жидкости Premium',price:490,sku:'929907',emoji:'🌫️',photo:''},
  {id:'929899',name:'GANG X-BOX 20 EXTRA HARD',brand:'GANG',cat:'Жидкости Premium',price:230,sku:'929899',emoji:'💥',photo:''},
  {id:'929764',name:'ICE FOX PREMIUM HARD (40 вкусов)',brand:'ICEBERG',cat:'Жидкости Premium',price:430,sku:'929764',emoji:'🦊',photo:''},
  {id:'929846',name:'INFLAVE PREMIUM',brand:'INFLAVE',cat:'Жидкости Premium',price:490,sku:'929846',emoji:'🌿',photo:''},
  {id:'00318',name:'LIT ENERGY 5% (5 вкусов)',brand:'LIT ENERGY',cat:'Жидкости Premium',price:160,sku:'00318',emoji:'⚡',photo:''},
  {id:'00254',name:'MONSTERVAPOR 5%',brand:'MONSTERVAPOR',cat:'Жидкости Premium',price:220,sku:'00254',emoji:'👾',photo:''},
  {id:'00576',name:'MONSTERVAPOR 2%',brand:'MONSTERVAPOR',cat:'Жидкости Premium',price:210,sku:'00576',emoji:'👾',photo:''},
  {id:'929911',name:'NARCOZ 2% (25 вкусов)',brand:'NARCOZ',cat:'Жидкости Premium',price:250,sku:'929911',emoji:'🌙',photo:''},
  {id:'929427',name:'NARCOZ 5%',brand:'NARCOZ',cat:'Жидкости Premium',price:260,sku:'929427',emoji:'🌙',photo:''},
  {id:'929898',name:'OGGO PRIME HARD (40 вкусов)',brand:'OGGO',cat:'Жидкости Premium',price:280,sku:'929898',emoji:'🎯',photo:''},
  {id:'929920',name:'RELL ULTIMATE',brand:'RELL',cat:'Жидкости Premium',price:335,sku:'929920',emoji:'👑',photo:''},
  {id:'929651',name:'SKALA 2% (5 вкусов)',brand:'SKALA',cat:'Жидкости Premium',price:169,sku:'929651',emoji:'🏔️',photo:''},
  {id:'929906',name:'SKALA 5% (20 вкусов)',brand:'SKALA',cat:'Жидкости Premium',price:220,sku:'929906',emoji:'🏔️',photo:''},
  {id:'00237',name:'SKALA v2 (10 вкусов)',brand:'SKALA',cat:'Жидкости Premium',price:160,sku:'00237',emoji:'🏔️',photo:''},
  {id:'929874',name:'TOXIC FRUITS (15 вкусов)',brand:'TOXIC FRUITS',cat:'Жидкости Premium',price:190,sku:'929874',emoji:'🍈',photo:''},
  {id:'00588',name:'TOYZ STRONG',brand:'TOYZ',cat:'Жидкости Premium',price:280,sku:'00588',emoji:'🎲',photo:''},
  {id:'00394',name:'TRAPA UP 5% (20 вкусов)',brand:'TRAVA',cat:'Жидкости Premium',price:220,sku:'00394',emoji:'🌱',photo:''},
  {id:'00586',name:'ИНДИВИDUALL 2/5%',brand:'ИНДИВИDUALL',cat:'Жидкости Premium',price:230,sku:'00586',emoji:'🎭',photo:''},
  {id:'929909',name:'LEGEND МИШКА HUSKY 20 strong',brand:'МИШКА HUSKY',cat:'Жидкости Premium',price:235,sku:'929909',emoji:'🐻',photo:''},
  {id:'929922',name:'МРАК by Че НАДО? 60mg (10 вкусов)',brand:'МРАК',cat:'Жидкости Premium',price:240,sku:'929922',emoji:'😈',photo:''},
  {id:'929863',name:'ПСИХ 6% (10 вкусов)',brand:'ПСИХ',cat:'Жидкости Premium',price:190,sku:'929863',emoji:'🤪',photo:''},
  {id:'929924',name:'РИК и МОРТИ ЗАМЕРЗОН MEDIUM (10 вкусов)',brand:'РИК и МОРТИ',cat:'Жидкости Premium',price:230,sku:'929924',emoji:'🛸',photo:''},
  {id:'929923',name:'РИК и МОРТИ ЗАМЕРЗОН STRONG (9 вкусов)',brand:'РИК и МОРТИ',cat:'Жидкости Premium',price:240,sku:'929923',emoji:'🛸',photo:''},
  {id:'929928',name:'FOGGY 6% (12 вкусов)',brand:'FOGGY',cat:'Жидкости Premium',price:220,sku:'929928',emoji:'🌫️',photo:''},
  {id:'929930',name:'FUMO LIT 25 000 PUFF',brand:'FUMO',cat:'Жидкости Premium',price:380,sku:'929930',emoji:'🌫️',photo:''},
  {id:'929912',name:'INSPO COSMIX',brand:'INSPO',cat:'Жидкости Premium',price:460,sku:'929912',emoji:'✨',photo:''},
  {id:'929931',name:'MAD 70mg',brand:'MAD',cat:'Жидкости Premium',price:240,sku:'929931',emoji:'😤',photo:''},
  {id:'929926',name:'MALASIAN PODONKI',brand:'MALASIAN',cat:'Жидкости Premium',price:235,sku:'929926',emoji:'🧴',photo:''},
  {id:'929927',name:'PODONKI / HOTSPOT',brand:'PODONKI',cat:'Жидкости Premium',price:245,sku:'929927',emoji:'🔥',photo:''},
  {id:'929929',name:'PODONKI VINTAGE',brand:'PODONKI',cat:'Жидкости Premium',price:240,sku:'929929',emoji:'🍷',photo:''},
  // Устройства
  {id:'929693',name:'BRUSKO MINICAN',brand:'Brusko',cat:'Устройства (Поды)',price:230,sku:'929693',emoji:'📱',photo:''},
  {id:'929667',name:'BRUSKO PAGEE AIR',brand:'Brusko',cat:'Устройства (Поды)',price:190,sku:'929667',emoji:'📱',photo:''},
  {id:'929886',name:'Feelin pro2 (злой)',brand:'Brusko',cat:'Устройства (Поды)',price:270,sku:'929886',emoji:'📱',photo:''},
  {id:'929601',name:'MINIKAN FLICK',brand:'Brusko',cat:'Устройства (Поды)',price:170,sku:'929601',emoji:'📱',photo:''},
  {id:'929820',name:'AEGIS FORCE',brand:'Geekvape',cat:'Устройства (Поды)',price:2350,sku:'929820',emoji:'⚙️',photo:''},
  {id:'00519',name:'BOOST 3',brand:'Geekvape',cat:'Устройства (Поды)',price:2350,sku:'00519',emoji:'⚙️',photo:''},
  {id:'00775',name:'DIGI MAX R',brand:'Geekvape',cat:'Устройства (Поды)',price:2350,sku:'00775',emoji:'⚙️',photo:''},
  {id:'00085',name:'Geekvape Aegis Boost 2 / B60',brand:'Geekvape',cat:'Устройства (Поды)',price:2200,sku:'00085',emoji:'⚙️',photo:''},
  {id:'00089',name:'Geekvape Aegis Hero 2',brand:'Geekvape',cat:'Устройства (Поды)',price:2000,sku:'00089',emoji:'⚙️',photo:''},
  {id:'00469',name:'Geekvape Aegis hero Q',brand:'Geekvape',cat:'Устройства (Поды)',price:1400,sku:'00469',emoji:'⚙️',photo:''},
  {id:'929856',name:'GEEKVAPE B100 KIT (100w)',brand:'Geekvape',cat:'Устройства (Поды)',price:2300,sku:'929856',emoji:'⚙️',photo:''},
  {id:'929660',name:'HERO 3',brand:'Geekvape',cat:'Устройства (Поды)',price:1960,sku:'929660',emoji:'⚙️',photo:''},
  {id:'929485',name:'HERO 5',brand:'Geekvape',cat:'Устройства (Поды)',price:2100,sku:'929485',emoji:'⚙️',photo:''},
  {id:'929823',name:'HERO 5 EDITION',brand:'Geekvape',cat:'Устройства (Поды)',price:2350,sku:'929823',emoji:'⚙️',photo:''},
  {id:'929771',name:'SONDER Q',brand:'Geekvape',cat:'Устройства (Поды)',price:600,sku:'929771',emoji:'⚙️',photo:''},
  {id:'00698',name:'SONDER Q2',brand:'Geekvape',cat:'Устройства (Поды)',price:650,sku:'00698',emoji:'⚙️',photo:''},
  {id:'929491',name:'WENAX Q2',brand:'Geekvape',cat:'Устройства (Поды)',price:1380,sku:'929491',emoji:'⚙️',photo:''},
  {id:'929654',name:'WENAX Q ULTRA 1300mah',brand:'Geekvape',cat:'Устройства (Поды)',price:1780,sku:'929654',emoji:'⚙️',photo:''},
  {id:'929883',name:'Centaurus E40',brand:'Lost Vape',cat:'Устройства (Поды)',price:1320,sku:'929883',emoji:'🎯',photo:''},
  {id:'00666',name:'Lost Vape 0.15',brand:'Lost Vape',cat:'Устройства (Поды)',price:1100,sku:'00666',emoji:'🎯',photo:''},
  {id:'929590',name:'THELEMA ELITE S',brand:'Lost Vape',cat:'Устройства (Поды)',price:800,sku:'929590',emoji:'🎯',photo:''},
  {id:'929745',name:'THELEMA mini',brand:'Lost Vape',cat:'Устройства (Поды)',price:1990,sku:'929745',emoji:'🎯',photo:''},
  {id:'00777',name:'MANTO AIO BABY',brand:'Rincoe',cat:'Устройства (Поды)',price:2400,sku:'00777',emoji:'📦',photo:''},
  {id:'929712',name:'MANTO AIO BABY 2',brand:'Rincoe',cat:'Устройства (Поды)',price:2400,sku:'929712',emoji:'📦',photo:''},
  {id:'00876',name:'MANTO NANO A2',brand:'Rincoe',cat:'Устройства (Поды)',price:600,sku:'00876',emoji:'📦',photo:''},
  {id:'00117',name:'Rincoe MANTO AIO Plus',brand:'Rincoe',cat:'Устройства (Поды)',price:1300,sku:'00117',emoji:'📦',photo:''},
  {id:'00264',name:'Rincoe MANTO Aio Pro 80W',brand:'Rincoe',cat:'Устройства (Поды)',price:2450,sku:'00264',emoji:'📦',photo:''},
  {id:'00265',name:'Rincoe MANTO Aio Ultra 80W',brand:'Rincoe',cat:'Устройства (Поды)',price:2500,sku:'00265',emoji:'📦',photo:''},
  {id:'929878',name:'Charon baby+',brand:'Smoant',cat:'Устройства (Поды)',price:870,sku:'929878',emoji:'💡',photo:''},
  {id:'00808',name:'KNIGHT AIO KIT',brand:'Smoant',cat:'Устройства (Поды)',price:2400,sku:'00808',emoji:'💡',photo:''},
  {id:'929746',name:'Pasito 2',brand:'Smoant',cat:'Устройства (Поды)',price:1930,sku:'929746',emoji:'💡',photo:''},
  {id:'929748',name:'Pasito 3',brand:'Smoant',cat:'Устройства (Поды)',price:2600,sku:'929748',emoji:'💡',photo:''},
  {id:'00124',name:'Smoant CHARON baby',brand:'Smoant',cat:'Устройства (Поды)',price:730,sku:'00124',emoji:'💡',photo:''},
  {id:'00429',name:'Smoant Charon Racer',brand:'Smoant',cat:'Устройства (Поды)',price:1380,sku:'00429',emoji:'💡',photo:''},
  {id:'00128',name:'Smoant KNIGHT 80',brand:'Smoant',cat:'Устройства (Поды)',price:2150,sku:'00128',emoji:'💡',photo:''},
  {id:'00131',name:'Smoant PASITO Mini',brand:'Smoant',cat:'Устройства (Поды)',price:1800,sku:'00131',emoji:'💡',photo:''},
  {id:'00268',name:'Smoant PASITO PRO',brand:'Smoant',cat:'Устройства (Поды)',price:1800,sku:'00268',emoji:'💡',photo:''},
  {id:'00692',name:'PULSE AIO MINI KIT',brand:'Vandy Vape',cat:'Устройства (Поды)',price:2400,sku:'00692',emoji:'🔋',photo:''},
  {id:'00746',name:'VAPORESSO ARMOUR G',brand:'Vaporesso',cat:'Устройства (Поды)',price:2500,sku:'00746',emoji:'💎',photo:''},
  {id:'00159',name:'VAPORESSO XROS 3 Mini',brand:'Vaporesso',cat:'Устройства (Поды)',price:795,sku:'00159',emoji:'💎',photo:''},
  {id:'00242',name:'VAPORESSO XROS 4',brand:'Vaporesso',cat:'Устройства (Поды)',price:1400,sku:'00242',emoji:'💎',photo:''},
  {id:'00162',name:'VAPORESSO XROS 4 MINI (10 цветов)',brand:'Vaporesso',cat:'Устройства (Поды)',price:880,sku:'00162',emoji:'💎',photo:''},
  {id:'00378',name:'VAPORESSO XROS 4 NANO',brand:'Vaporesso',cat:'Устройства (Поды)',price:1480,sku:'00378',emoji:'💎',photo:''},
  {id:'00164',name:'VAPORESSO XROS MINI (16 цветов)',brand:'Vaporesso',cat:'Устройства (Поды)',price:700,sku:'00164',emoji:'💎',photo:''},
  {id:'00165',name:'VAPORESSO XROS PRO',brand:'Vaporesso',cat:'Устройства (Поды)',price:1730,sku:'00165',emoji:'💎',photo:''},
  {id:'00827',name:'XROS 5 (10 цветов)',brand:'Vaporesso',cat:'Устройства (Поды)',price:1480,sku:'00827',emoji:'💎',photo:''},
  {id:'929668',name:'XROS 5 LEATHER EDITION',brand:'Vaporesso',cat:'Устройства (Поды)',price:1450,sku:'929668',emoji:'💎',photo:''},
  {id:'929730',name:'XROS 5 MINI (10 цветов)',brand:'Vaporesso',cat:'Устройства (Поды)',price:980,sku:'929730',emoji:'💎',photo:''},
  {id:'929669',name:'XROS 5 mini LEATHER',brand:'Vaporesso',cat:'Устройства (Поды)',price:970,sku:'929669',emoji:'💎',photo:''},
  {id:'929796',name:'XROS 5 NANO',brand:'Vaporesso',cat:'Устройства (Поды)',price:1850,sku:'929796',emoji:'💎',photo:''},
  {id:'929482',name:'XROS CUBE',brand:'Vaporesso',cat:'Устройства (Поды)',price:880,sku:'929482',emoji:'💎',photo:''},
  {id:'00740',name:'XROS ECO NANO',brand:'Vaporesso',cat:'Устройства (Поды)',price:450,sku:'00740',emoji:'💎',photo:''},
  {id:'929575',name:'XROS PRO 2',brand:'Vaporesso',cat:'Устройства (Поды)',price:1950,sku:'929575',emoji:'💎',photo:''},
  {id:'929904',name:'DRAG H80 S',brand:'Voopoo',cat:'Устройства (Поды)',price:1500,sku:'929904',emoji:'🐉',photo:''},
  {id:'929684',name:'VMATE E',brand:'Voopoo',cat:'Устройства (Поды)',price:1000,sku:'929684',emoji:'🐉',photo:''},
  {id:'929643',name:'VMATE mini (ватрушка)',brand:'Voopoo',cat:'Устройства (Поды)',price:660,sku:'929643',emoji:'🐉',photo:''},
  {id:'00281',name:'Voopoo Drag Nano 2',brand:'Voopoo',cat:'Устройства (Поды)',price:580,sku:'00281',emoji:'🐉',photo:''},
  // Расходники
  {id:'00096',name:'Испаритель GEEK VAPE B 0.2 (5шт)',brand:'Geekvape',cat:'Расходники',price:750,sku:'00096',emoji:'🔩',photo:''},
  {id:'00097',name:'Испаритель GEEK VAPE B 0.3 (5шт)',brand:'Geekvape',cat:'Расходники',price:750,sku:'00097',emoji:'🔩',photo:''},
  {id:'00103',name:'Картридж Aegis Nano 0.6Ω (2шт)',brand:'Geekvape',cat:'Расходники',price:420,sku:'00103',emoji:'🔩',photo:''},
  {id:'00111',name:'Картридж Geek Vape B100',brand:'Geekvape',cat:'Расходники',price:500,sku:'00111',emoji:'🔩',photo:''},
  {id:'00106',name:'Картридж GEEK VAPE Sonder Q 0.6Ω (3шт)',brand:'Geekvape',cat:'Расходники',price:520,sku:'00106',emoji:'🔩',photo:''},
  {id:'00110',name:'Картридж Aegis Hero H45 (2шт)',brand:'Geekvape',cat:'Расходники',price:750,sku:'00110',emoji:'🔩',photo:''},
  {id:'929825',name:'КАРТРИДЖ B100 4.5ml (2шт)',brand:'Geekvape',cat:'Расходники',price:550,sku:'929825',emoji:'🔩',photo:''},
  {id:'929824',name:'КАРТРИДЖ B60 5ml (2шт)',brand:'Geekvape',cat:'Расходники',price:510,sku:'929824',emoji:'🔩',photo:''},
  {id:'929576',name:'КАРТРИДЖ H-45 HERO 6.5ml',brand:'Geekvape',cat:'Расходники',price:340,sku:'929576',emoji:'🔩',photo:''},
  {id:'929879',name:'Картридж URSA 0.6',brand:'Lost Vape',cat:'Расходники',price:480,sku:'929879',emoji:'🔩',photo:''},
  {id:'00120',name:'Испаритель MANTO AIO 0.15Ω',brand:'Rincoe',cat:'Расходники',price:380,sku:'00120',emoji:'🔩',photo:''},
  {id:'929404',name:'Картридж manto aio',brand:'Rincoe',cat:'Расходники',price:300,sku:'929404',emoji:'🔩',photo:''},
  {id:'929405',name:'Картридж manto aio ultra',brand:'Rincoe',cat:'Расходники',price:320,sku:'929405',emoji:'🔩',photo:''},
  {id:'00125',name:'Испаритель Charon baby 0.6Ω',brand:'Smoant',cat:'Расходники',price:350,sku:'00125',emoji:'🔩',photo:''},
  {id:'929773',name:'ИСПАРИТЕЛЬ K-4 (55-65w)',brand:'Smoant',cat:'Расходники',price:420,sku:'929773',emoji:'🔩',photo:''},
  {id:'929751',name:'ИСПАРИТЕЛЬ K-5 (70-90w)',brand:'Smoant',cat:'Расходники',price:435,sku:'929751',emoji:'🔩',photo:''},
  {id:'00537',name:'Испаритель Pasito mini P-1 0.6Ω',brand:'Smoant',cat:'Расходники',price:340,sku:'00537',emoji:'🔩',photo:''},
  {id:'00134',name:'Испаритель Smoant K1 0.3Ω',brand:'Smoant',cat:'Расходники',price:390,sku:'00134',emoji:'🔩',photo:''},
  {id:'00139',name:'Испаритель Smoant Santi S4 0.35Ω',brand:'Smoant',cat:'Расходники',price:355,sku:'00139',emoji:'🔩',photo:''},
  {id:'00737',name:'КАРТРИДЖ CHARON BABY одноразовый',brand:'Smoant',cat:'Расходники',price:320,sku:'00737',emoji:'🔩',photo:''},
  {id:'929752',name:'КАРТРИДЖ / БАК PASITO 2',brand:'Smoant',cat:'Расходники',price:330,sku:'929752',emoji:'🔩',photo:''},
  {id:'929758',name:'XROS КАРТРИДЖ 0.4',brand:'Vaporesso',cat:'Расходники',price:710,sku:'929758',emoji:'🔩',photo:''},
  {id:'00175',name:'Картридж XROS Series 0.6Ω 2ml',brand:'Vaporesso',cat:'Расходники',price:620,sku:'00175',emoji:'🔩',photo:''},
  {id:'00717',name:'Картридж XROS 0.8Ω COREX 3 (4шт)',brand:'Vaporesso',cat:'Расходники',price:670,sku:'00717',emoji:'🔩',photo:''},
  {id:'929837',name:'КАРТРИДЖИ XROS 0.6 3ml (4шт)',brand:'Vaporesso',cat:'Расходники',price:680,sku:'929837',emoji:'🔩',photo:''},
  {id:'929880',name:'ИСПАРИТЕЛЬ PNP-TW20 (55w)',brand:'Voopoo',cat:'Расходники',price:750,sku:'929880',emoji:'🔩',photo:''},
  {id:'00195',name:'Картридж Vmate V2 0.7Ω 3ml (2шт)',brand:'Voopoo',cat:'Расходники',price:389,sku:'00195',emoji:'🔩',photo:''},
  {id:'929543',name:'Картридж Lost Mary x-link',brand:'Lost Mary',cat:'Расходники',price:550,sku:'929543',emoji:'🔩',photo:''},
  {id:'929859',name:'КАРТРИДЖИ MOTI 12.000 puff (15 вкусов)',brand:'MOTI',cat:'Расходники',price:95,sku:'929859',emoji:'🔩',photo:''},
  // Одноразки
  {id:'929802',name:'FLABAR 25.000 (10 вкусов)',brand:'FLABAR',cat:'Одноразки',price:345,sku:'929802',emoji:'🚬',photo:''},
  {id:'929756',name:'FLABAR 7.000 puff (7 вкусов)',brand:'FLABAR',cat:'Одноразки',price:169,sku:'929756',emoji:'🚬',photo:''},
  {id:'929806',name:'FLABAR TX7000 слив цена',brand:'FLABAR',cat:'Одноразки',price:290,sku:'929806',emoji:'🚬',photo:''},
  {id:'929804',name:'FLABAR до 50.000 тяг',brand:'FLABAR',cat:'Одноразки',price:340,sku:'929804',emoji:'🚬',photo:''},
  {id:'929779',name:'MIX ОДНОРАЗОК ПО 169₽',brand:'MIX',cat:'Одноразки',price:250,sku:'929779',emoji:'🚬',photo:''},
  {id:'929781',name:'UPENDS устройство + 3 картриджа в подарок',brand:'UPENDS',cat:'Одноразки',price:189,sku:'929781',emoji:'🚬',photo:''},
  {id:'929677',name:'ELF BAR 25.000 MOONNINGHT',brand:'ELF BAR',cat:'Одноразки',price:725,sku:'929677',emoji:'🌟',photo:''},
  {id:'929717',name:'ELF BAR BC 10.000',brand:'ELF BAR',cat:'Одноразки',price:470,sku:'929717',emoji:'🌟',photo:''},
  {id:'929739',name:'ELF BAR BC30.000',brand:'ELF BAR',cat:'Одноразки',price:790,sku:'929739',emoji:'🌟',photo:''},
  {id:'929934',name:'ELFBAR BC 30.000 (15 вкусов)',brand:'ELF BAR',cat:'Одноразки',price:730,sku:'929934',emoji:'🌟',photo:''},
  {id:'00345',name:'ELF BAR FS 18000 skye se',brand:'ELF BAR',cat:'Одноразки',price:625,sku:'00345',emoji:'🌟',photo:''},
  {id:'929402',name:'ELF BAR GH 23.000',brand:'ELF BAR',cat:'Одноразки',price:810,sku:'929402',emoji:'🌟',photo:''},
  {id:'929532',name:'ELF BAR NIC KING 30.000',brand:'ELF BAR',cat:'Одноразки',price:720,sku:'929532',emoji:'🌟',photo:''},
  {id:'929847',name:'esmoco 40.000 puff (9 вкусов)',brand:'esmoco',cat:'Одноразки',price:850,sku:'929847',emoji:'🚬',photo:''},
  {id:'929709',name:'FLUM PREMIUM',brand:'FLUM',cat:'Одноразки',price:240,sku:'929709',emoji:'🚬',photo:''},
  {id:'929855',name:'GANG IMMORTAL 16.000 (15 вкусов)',brand:'GANG',cat:'Одноразки',price:1065,sku:'929855',emoji:'💥',photo:''},
  {id:'929903',name:'GEEK BAR 911 18.000 puff (10 вкусов)',brand:'GeekBar',cat:'Одноразки',price:370,sku:'929903',emoji:'🚬',photo:''},
  {id:'929865',name:'HQD 7.000 PUFF',brand:'HQD',cat:'Одноразки',price:230,sku:'929865',emoji:'🚬',photo:''},
  {id:'929817',name:'HUSKY 25.000 puff ULTRA STRONG (20 вкусов)',brand:'HUSKY',cat:'Одноразки',price:650,sku:'929817',emoji:'🐺',photo:''},
  {id:'929666',name:'IZY PRO 3.000 PUFF (10 вкусов)',brand:'IZY',cat:'Одноразки',price:95,sku:'929666',emoji:'🚬',photo:''},
  {id:'929544',name:'LOST MARY 30K puff ball',brand:'Lost Mary',cat:'Одноразки',price:830,sku:'929544',emoji:'🍭',photo:''},
  {id:'00290',name:'Lost Mary BM 16000 ENG',brand:'Lost Mary',cat:'Одноразки',price:830,sku:'00290',emoji:'🍭',photo:''},
  {id:'00350',name:'LOST MARY COMBO 20000',brand:'Lost Mary',cat:'Одноразки',price:550,sku:'00350',emoji:'🍭',photo:''},
  {id:'00728',name:'LOST MARY MIXER+ 25000',brand:'Lost Mary',cat:'Одноразки',price:880,sku:'00728',emoji:'🍭',photo:''},
  {id:'00252',name:'Lost Mary MO 10000',brand:'Lost Mary',cat:'Одноразки',price:850,sku:'00252',emoji:'🍭',photo:''},
  {id:'929715',name:'LOST MARY MO 30.000',brand:'Lost Mary',cat:'Одноразки',price:770,sku:'929715',emoji:'🍭',photo:''},
  {id:'00893',name:'LOST MARY MT15000',brand:'Lost Mary',cat:'Одноразки',price:690,sku:'00893',emoji:'🍭',photo:''},
  {id:'00802',name:'LOST MARY OS12.000',brand:'Lost Mary',cat:'Одноразки',price:590,sku:'00802',emoji:'🍭',photo:''},
  {id:'00785',name:'LOST MARY X-LINK 20000 puff',brand:'Lost Mary',cat:'Одноразки',price:850,sku:'00785',emoji:'🍭',photo:''},
  {id:'929674',name:'LOST MARY (без дыма)',brand:'Lost Mary',cat:'Одноразки',price:900,sku:'929674',emoji:'🍭',photo:''},
  {id:'929754',name:'MKG 30.000 puff (10 вкусов)',brand:'MKG',cat:'Одноразки',price:360,sku:'929754',emoji:'🚬',photo:''},
  {id:'929814',name:'MOTI 12.000 PUFF (+1 картридж подарок)',brand:'MOTI',cat:'Одноразки',price:260,sku:'929814',emoji:'🚬',photo:''},
  {id:'929812',name:'NEXA PRO 30.000 PUFF (10 вкусов)',brand:'NEXA',cat:'Одноразки',price:450,sku:'929812',emoji:'🚬',photo:''},
  {id:'929925',name:'PAFOS 20.000 puff (21 вкус)',brand:'PAFOS',cat:'Одноразки',price:1220,sku:'929925',emoji:'🚬',photo:''},
  {id:'929819',name:'PUFFMI DURA 18.000 (18 вкусов)',brand:'PuffMi',cat:'Одноразки',price:410,sku:'929819',emoji:'🚬',photo:''},
  {id:'929768',name:'PUFFMY FLORA 25.000',brand:'PuffMi',cat:'Одноразки',price:950,sku:'929768',emoji:'🚬',photo:''},
  {id:'929761',name:'VOZOL RAVE 46.000',brand:'VOZOL',cat:'Одноразки',price:770,sku:'929761',emoji:'🚬',photo:''},
  {id:'929634',name:'VOZOL VISTA 20.000',brand:'VOZOL',cat:'Одноразки',price:600,sku:'929634',emoji:'🚬',photo:''},
  {id:'929788',name:'WAKA 45.000 puff',brand:'Waka',cat:'Одноразки',price:1150,sku:'929788',emoji:'🌊',photo:''},
  {id:'929789',name:'WAKA E.T 35.000 puff (18 вкусов)',brand:'Waka',cat:'Одноразки',price:670,sku:'929789',emoji:'🌊',photo:''},
  {id:'929790',name:'WAKA EXTRA 20.000',brand:'Waka',cat:'Одноразки',price:1150,sku:'929790',emoji:'🌊',photo:''},
  {id:'929787',name:'WAKA XLAND 35.000 puff',brand:'Waka',cat:'Одноразки',price:750,sku:'929787',emoji:'🌊',photo:''},
  {id:'929881',name:'Rick and Morty 25000',brand:'Рик и Морти',cat:'Одноразки',price:890,sku:'929881',emoji:'🛸',photo:''},
  {id:'929870',name:'RICK AND MORTY ZOMBIE 23.000 (20 вкусов)',brand:'Рик и Морти',cat:'Одноразки',price:700,sku:'929870',emoji:'🛸',photo:''},
  {id:'929765',name:'Рик и Морти замерзон кислые 20.000',brand:'Рик и Морти',cat:'Одноразки',price:680,sku:'929765',emoji:'🛸',photo:''},
  {id:'929937',name:'URSA EPOCH (РАСПРОДАЖА)',brand:'URSA',cat:'Одноразки',price:130,sku:'929937',emoji:'🚬',photo:''},
  // Пластинки
  {id:'929791',name:'LOOP (7 вкусов)',brand:'LOOP',cat:'Пластинки',price:190,sku:'929791',emoji:'🍃',photo:''},
  {id:'929658',name:'PODONKI CRITICAL (10 вкусов) 3+1',brand:'PODONKI',cat:'Пластинки',price:150,sku:'929658',emoji:'🍃',photo:''},
  {id:'929665',name:'PODONKI LAST HAP (10 вкусов) 3+1',brand:'PODONKI',cat:'Пластинки',price:150,sku:'929665',emoji:'🍃',photo:''},
  {id:'929626',name:'PODONKI MAD (10 вкусов) 3+1',brand:'PODONKI',cat:'Пластинки',price:150,sku:'929626',emoji:'🍃',photo:''},
  // Слив цена
  {id:'929707',name:'BRUSKO FAVOSTIX 1000mAh (СЛИВ)',brand:'Brusko',cat:'Слив цена',price:220,sku:'929707',emoji:'💸',photo:''},
  {id:'929653',name:'DABLER под (СЛИВ)',brand:'DABLER',cat:'Слив цена',price:100,sku:'929653',emoji:'💸',photo:''},
  {id:'929763',name:'DORIC Q (СЛИВ)',brand:'DORIC',cat:'Слив цена',price:190,sku:'929763',emoji:'💸',photo:''},
  {id:'929663',name:'FEELIN (ref)',brand:'FEELIN',cat:'Слив цена',price:250,sku:'929663',emoji:'💸',photo:''},
  {id:'929794',name:'VILTER FUN 450mah',brand:'VILTER',cat:'Слив цена',price:100,sku:'929794',emoji:'💸',photo:''},
  {id:'929795',name:'VILTER REF 400mah',brand:'VILTER',cat:'Слив цена',price:100,sku:'929795',emoji:'💸',photo:''},
  {id:'929794b',name:'VILTER BOX 100шт',brand:'VILTER',cat:'Слив цена',price:6500,sku:'929794b',emoji:'📦',photo:''},
  // Снюс
  {id:'929583',name:'СНЮС CHN 11g (2 вкуса)',brand:'CHN',cat:'Снюс',price:95,sku:'929583',emoji:'🟤',photo:''},
  {id:'929624',name:'СНЮС CORVUS 16g (2 вкуса)',brand:'CORVUS',cat:'Снюс',price:140,sku:'929624',emoji:'🟤',photo:''},
  {id:'929593',name:'СНЮС DLTA',brand:'DLTA',cat:'Снюс',price:220,sku:'929593',emoji:'🟤',photo:''},
  {id:'929734',name:'СНЮС GUCCI 200mg',brand:'GUCCI',cat:'Снюс',price:230,sku:'929734',emoji:'🟤',photo:''},
  {id:'929716',name:'СНЮС ICEBERN',brand:'ICEBERN',cat:'Снюс',price:185,sku:'929716',emoji:'🟤',photo:''},
  {id:'929733',name:'СНЮС ISTERIKA HOTSPOT 180мг',brand:'ISTERIKA',cat:'Снюс',price:225,sku:'929733',emoji:'🟤',photo:''},
  {id:'929784',name:'СНЮС ISTERIKA x ЗЛАЯ МОНАШКА',brand:'ISTERIKA',cat:'Снюс',price:240,sku:'929784',emoji:'🟤',photo:''},
  {id:'00628',name:'СНЮС KASTA 101',brand:'KASTA',cat:'Снюс',price:200,sku:'00628',emoji:'🟤',photo:''},
  {id:'929936',name:'СНЮС KASTA COVID 228/666',brand:'KASTA',cat:'Снюс',price:185,sku:'929936',emoji:'🟤',photo:''},
  {id:'929731',name:'СНЮС KASTA DOTA',brand:'KASTA',cat:'Снюс',price:200,sku:'929731',emoji:'🟤',photo:''},
  {id:'00587',name:'СНЮС MAD 100mg',brand:'MAD',cat:'Снюс',price:220,sku:'00587',emoji:'🟤',photo:''},
  {id:'929849',name:'СНЮС PODONKI SLICK (10 вкусов)',brand:'PODONKI',cat:'Снюс',price:230,sku:'929849',emoji:'🟤',photo:''},
  {id:'00784',name:'СНЮС RED',brand:'RED',cat:'Снюс',price:200,sku:'00784',emoji:'🟤',photo:''},
  {id:'929897',name:'СНЮС VELO',brand:'VELO',cat:'Снюс',price:100,sku:'929897',emoji:'🟤',photo:''},
  {id:'929691',name:'СНЮС ГРЕХ 259 (10 вкусов)',brand:'ГРЕХ',cat:'Снюс',price:250,sku:'929691',emoji:'🟤',photo:''},
  {id:'00668',name:'ТАБАЧНЫЙ СНЮС ODENS',brand:'ODENS',cat:'Снюс',price:180,sku:'00668',emoji:'🟤',photo:''},
  {id:'929935',name:'Снюс каста 228',brand:'KASTA',cat:'Снюс',price:240,sku:'929935',emoji:'🟤',photo:''},
  // Электроника
  {id:'929705',name:'AirPods pro 2 (шум подавление)',brand:'Apple',cat:'Электроника',price:1000,sku:'929705',emoji:'🎧',photo:''},
  {id:'929896',name:'Блок TYPE-C',brand:'',cat:'Электроника',price:300,sku:'929896',emoji:'🔌',photo:''},
  {id:'929842',name:'ДЕРЖАТЕЛИ ДЛЯ ТЕЛЕФОНА НА ПРИСОСКЕ',brand:'',cat:'Электроника',price:50,sku:'929842',emoji:'📱',photo:''},
  {id:'929876',name:'Колонка k-10 60w',brand:'',cat:'Электроника',price:2900,sku:'929876',emoji:'🔊',photo:''},
  {id:'929828',name:'Повербанк iPhone Battery Pack',brand:'Apple',cat:'Электроника',price:450,sku:'929828',emoji:'🔋',photo:''},
  // Прочее
  {id:'929541',name:'НИК БУСТЕР 2%',brand:'',cat:'Никобустер',price:35,sku:'929541',emoji:'💉',photo:''},
  {id:'929800',name:'КАЛЬЯН H2O НА ПОД СИСТЕМЕ',brand:'H2O',cat:'Кальяны',price:3000,sku:'929800',emoji:'🫗',photo:''},
  {id:'929939',name:'ann',brand:'',cat:'Разное',price:290,sku:'929939',emoji:'📦',photo:''},
  {id:'929932',name:'ЭНЕРГЕТИКИ SWONQ (4 вкуса)',brand:'SWONQ',cat:'Разное',price:150,sku:'929932',emoji:'⚡',photo:''},
  {id:'929938',name:'ХУЛИНЕТ?',brand:'',cat:'Разное',price:200,sku:'929938',emoji:'❓',photo:''},
]

const CAT_ICONS={'АКБ':'🔋','Баки и стекло':'💨','Бюджетные жидкости':'💧','Жидкости Premium':'✨','Устройства (Поды)':'📱','Расходники':'🔩','Одноразки':'🚬','Пластинки':'🍃','Снюс':'🟤','Слив цена':'💸','Электроника':'📡','Никобустер':'💉','Кальяны':'🫗','Разное':'📦'}
const DS={site_name:'Ways Pod',site_desc:'Прямые поставки от производителей.',logo_text:'WP',accent_color:'#2563eb',markup:0,markup_prev:0,manager_name:'Александр',manager_link:'https://t.me/wayspod_manager',tg_token:'',tg_chat_id:'',about_text:'Ways Pod — оптовый поставщик вейп-продукции.'}
const SEED_KEY='wp_seeded_v8'

function Img({src,emoji,size=36}){const[e,se]=useState(false);if(src&&!e)return<img src={src} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={()=>se(true)}/>;return<span style={{fontSize:size}}>{emoji||'📦'}</span>}

export default function App(){
  // Восстанавливаем корзину, форму из localStorage/cookie при инициализации
  const[prods,setProds]         = useState([])
  const[orders,setOrders]       = useState([])
  const[allOrders,setAllOrders] = useState([])
  const[users,setUsers]         = useState([])
  const[push,setPush]           = useState([])
  const[loading,setLoading]     = useState(true)
  const[seeding,setSeeding]     = useState(false)
  const[markup,setMarkup]       = useState(0)
  const[mkVal,setMkVal]         = useState(0)
  const[mkPrev,setMkPrev]       = useState(0)
  const[sName,setSName]         = useState(DS.site_name)
  const[sDesc,setSDesc]         = useState(DS.site_desc)
  const[accent,setAccent]       = useState(DS.accent_color)
  const[logo,setLogo]           = useState(DS.logo_text)
  const[mgrN,setMgrN]           = useState(DS.manager_name)
  const[mgrLink,setMgrLink]     = useState(DS.manager_link)
  const[tgTok,setTgTok]         = useState('')
  const[tgChat,setTgChat]       = useState('')
  const[aboutTxt,setAboutTxt]   = useState(DS.about_text)

  // Состояние UI — сохраняется
  const[cat,setCat]             = useState(()=>localStorage.getItem('wp_cat')||'Все')
  const[selBrand,setSelBrand]   = useState(()=>localStorage.getItem('wp_brand')||'')
  const[search,setSearch]       = useState('')
  const[cart,setCart]           = useState(()=>getSavedCart())
  const[screen,setScreen]       = useState('catalog')
  const[nav,setNav]             = useState(()=>localStorage.getItem('wp_nav')||'catalog')
  const[toast,setToast]         = useState(null)
  const[detail,setDetail]       = useState(null)
  const[banner,setBanner]       = useState(null)
  const[pushTxt,setPushTxt]     = useState('')
  const[busy,setBusy]           = useState(false)
  const[sideOpen,setSideOpen]   = useState(false)
  const[openCats,setOpenCats]   = useState({})
  const[adminOpen,setAdminOpen] = useState(false)
  const[adminAuth,setAdminAuth] = useState(false)
  const[pw,setPw]               = useState('')
  const[pwErr,setPwErr]         = useState(false)
  const[aTab,setATab]           = useState('analytics')
  const[tgSt,setTgSt]           = useState('none')
  const[tgBot,setTgBot]         = useState('')
  const[botUrl,setBotUrl]       = useState('')
  const[botSt,setBotSt]         = useState('')
  const[addOpen,setAddOpen]     = useState(false)
  const[ep,setEp]               = useState({id:'',name:'',brand:'',cat:'',price:'',unit:'',sku:'',emoji:'📦',photo:''})
  // Форма — восстанавливается из cookie
  const[form,setForm]           = useState({
    name:getSavedName(), phone:getSavedPhone(),
    delivery:getSavedDelivery(), addr:getSavedAddr()
  })
  const[saving,setSaving]       = useState(false)
  const lc=useRef(0);const lt=useRef(null)
  const visitorId = useRef(getVisitorId())

  // Сохраняем корзину при каждом изменении
  useEffect(()=>{ saveCart(cart) },[cart])
  useEffect(()=>{ localStorage.setItem('wp_nav',nav) },[nav])
  useEffect(()=>{ localStorage.setItem('wp_cat',cat) },[cat])
  useEffect(()=>{ localStorage.setItem('wp_brand',selBrand) },[selBrand])

  useEffect(()=>{ init() },[])

  function applySettings(s){
    if(!s)return
    setMarkup(s.markup||0);setMkVal(s.markup||0);setMkPrev(s.markup_prev||0)
    setSName(s.site_name||DS.site_name);setSDesc(s.site_desc||DS.site_desc)
    setAccent(s.accent_color||DS.accent_color);setLogo(s.logo_text||DS.logo_text)
    setMgrN(s.manager_name||DS.manager_name);setMgrLink(s.manager_link||DS.manager_link)
    setTgTok(s.tg_token||'');setTgChat(s.tg_chat_id||'')
    setAboutTxt(s.about_text||DS.about_text)
  }

  async function init(){
    setLoading(true)
    try{
      dbTrackVisitor(visitorId.current)
      const[p,o,s,ph,u]=await Promise.all([dbGetProducts(),dbGetOrders(),dbGetSettings(),dbGetPush(),dbGetUsers()])

      // Товары
      if(!ls(SEED_KEY)||!p||p.length<200){
        setSeeding(true)
        for(let i=0;i<ALL_PRODUCTS.length;i+=20){
          await Promise.all(ALL_PRODUCTS.slice(i,i+20).map(pr=>dbUpsertProduct(pr)))
        }
        lsSet(SEED_KEY,'1')
        setSeeding(false)
        setProds(ALL_PRODUCTS)
      } else { setProds(p.length>0?p:ALL_PRODUCTS) }

      // Заказы
      const ao=o||[];setAllOrders(ao)
      const mp=getSavedPhone();setOrders(mp?ao.filter(x=>x.phone===mp):[])
      setPush(ph||[]);setUsers(u||[])

      // Настройки
      applySettings(s)
    }catch(e){
      console.error('init error:',e)
      setProds(ALL_PRODUCTS)
    }
    setLoading(false)
  }

  useEffect(()=>{
    const ch=sb.channel('rt')
      .on('postgres_changes',{event:'*',schema:'public',table:'products'},()=>dbGetProducts().then(d=>{if(d&&d.length>0)setProds(d)}))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'orders'},ev=>{
        setAllOrders(prev=>[ev.new,...prev])
        const mp=getSavedPhone()
        if(mp&&ev.new.phone===mp)setOrders(prev=>[ev.new,...prev])
      })
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'users'},ev=>setUsers(prev=>[ev.new,...prev]))
      .on('postgres_changes',{event:'*',schema:'public',table:'settings'},()=>dbGetSettings().then(s=>applySettings(s)))
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'push_history'},ev=>setPush(prev=>[ev.new,...prev]))
      .subscribe()
    return()=>sb.removeChannel(ch)
  },[])

  const gp=b=>Math.round(b*(1+markup/100))

  // ── 2-УРОВНЕВЫЙ КАТАЛОГ: категория → бренд → товары ──
  // Группировка: cat → brand → [products]
  const catTree = {}
  prods.forEach(p => {
    if (!catTree[p.cat]) catTree[p.cat] = {}
    const br = p.brand || '(без бренда)'
    if (!catTree[p.cat][br]) catTree[p.cat][br] = []
    catTree[p.cat][br].push(p)
  })

  // Что показывать в сетке товаров:
  // если selBrand — товары этого бренда в выбранной категории
  // если cat — показываем бренды (и при клике на бренд — товары)
  // если ищем — показываем все совпадения
  const filtered = search
    ? prods.filter(p=>{const q=search.toLowerCase();return p.name?.toLowerCase().includes(q)||p.brand?.toLowerCase().includes(q)||p.sku?.toLowerCase().includes(q)})
    : selBrand
      ? (catTree[cat]?.[selBrand] || [])
      : cat !== 'Все'
        ? [] // показываем бренды, не товары
        : prods

  // Бренды в выбранной категории
  const brandsInCat = cat !== 'Все' && !selBrand ? Object.entries(catTree[cat] || {}).sort((a,b)=>a[0].localeCompare(b[0],'ru')) : []

  const ci=Object.values(cart).filter(i=>i.qty>0)
  const cc=ci.reduce((s,i)=>s+i.qty,0)
  const ct=ci.reduce((s,i)=>s+i.price*i.qty,0)
  const t_=(msg,type='ok')=>{setToast({msg,type});setTimeout(()=>setToast(null),2200)}

  const addCart=id=>{
    const p=prods.find(x=>x.id===id);if(!p)return
    setCart(prev=>{const ex=prev[id]||{id,name:p.name,price:gp(p.price),emoji:p.emoji||'📦',photo:p.photo||'',qty:0};return{...prev,[id]:{...ex,price:gp(p.price),qty:ex.qty+1}}})
    t_(`Добавлено: ${p.name.slice(0,22)}`)
  }
  const chQ=(id,d)=>setCart(prev=>{const it=prev[id];if(!it)return prev;const nq=it.qty+d;if(nq<=0){const n={...prev};delete n[id];return n}return{...prev,[id]:{...it,qty:nq}}})

  const updateForm=(field,val)=>{
    setForm(p=>({...p,[field]:val}))
    if(field==='phone')savePhone(val)
    if(field==='name')saveName(val)
    if(field==='delivery')saveDelivery(val)
    if(field==='addr')saveAddr(val)
  }

  const submitOrder=async()=>{
    if(!form.name||!form.phone){t_('Введите имя и телефон','err');return}
    if(!form.addr){t_('Введите адрес доставки','err');return}
    setBusy(true)
    const order={id:'WP'+Date.now().toString().slice(-6),name:form.name,phone:form.phone,delivery_type:form.delivery,delivery_addr:form.addr,items:ci,total:ct,visitor_id:visitorId.current,session_id:visitorId.current}
    await dbInsertOrder(order)
    await dbUpsertUser({phone:form.phone,name:form.name,visitor_id:visitorId.current})
    savePhone(form.phone);saveName(form.name)
    setOrders(prev=>[{...order,created_at:new Date().toISOString()},...prev])
    if(tgTok&&tgChat){
      try{
        const r=await fetch('/api/notify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order,tgToken:tgTok,tgChatId:tgChat})})
        const d=await r.json();console.log('notify:',d)
      }catch(e){console.error(e)}
    }
    setCart({});saveCart({})
    setBusy(false);setScreen('success')
  }

  const sendPush=async()=>{if(!pushTxt.trim())return;await dbAddPush(pushTxt.trim());setBanner(pushTxt);setPushTxt('');setTimeout(()=>setBanner(null),6000);t_('Рассылка отправлена')}

  const applyMarkup=async(val)=>{
    const prev=markup
    setMarkup(val);setMkVal(val);setMkPrev(prev)
    const ok=await dbSaveSettings({markup:val,markup_prev:prev})
    if(ok) t_(`Наценка ${val}% сохранена ✓`)
    else t_('Ошибка сохранения','err')
  }
  const rollbackMarkup=async()=>{
    if(mkPrev===markup){t_('Нечего откатывать','err');return}
    await applyMarkup(mkPrev)
    t_(`Откат: ${mkPrev}%`)
  }

  const saveAll=async()=>{
    setSaving(true)
    const ok=await dbSaveSettings({site_name:sName,site_desc:sDesc,logo_text:logo,accent_color:accent,manager_name:mgrN,manager_link:mgrLink,tg_token:tgTok,tg_chat_id:tgChat,markup,markup_prev:mkPrev,about_text:aboutTxt})
    setSaving(false)
    if(ok){t_('Настройки сохранены ✓')}else{t_('Ошибка сохранения','err')}
  }
  const editP=p=>{setEp({id:p.id,name:p.name,brand:p.brand||'',cat:p.cat||'',price:p.price,unit:p.unit||'',sku:p.sku||'',emoji:p.emoji||'📦',photo:p.photo||''});setAddOpen(true)}
  const newP=()=>{setEp({id:'',name:'',brand:'',cat:'',price:'',unit:'',sku:'',emoji:'📦',photo:''});setAddOpen(true)}
  const saveP=async()=>{if(!ep.name||!ep.price){t_('Заполните поля','err');return};const d={...ep,price:parseFloat(ep.price)||0,id:ep.id||'new_'+Date.now()};await dbUpsertProduct(d);setProds(prev=>{const i=prev.findIndex(p=>p.id===d.id);return i>=0?prev.map(p=>p.id===d.id?d:p):[...prev,d]});setAddOpen(false);t_('Сохранено')}
  const delP=async id=>{if(!confirm('Удалить?'))return;await dbDeleteProduct(id);setProds(prev=>prev.filter(p=>p.id!==id));t_('Удалено')}
  const checkTg=async()=>{if(!tgTok)return;try{const r=await fetch(`https://api.telegram.org/bot${tgTok}/getMe`);const d=await r.json();if(d.ok){setTgSt('ok');setTgBot('@'+d.result.username)}else setTgSt('error')}catch{setTgSt('error')}}
  const setupBot=async()=>{
    if(!tgTok){t_('Введите токен','err');return}
    if(!botUrl){t_('Введите URL сайта','err');return}
    setBotSt('⏳ Подключаем...')
    try{
      const u=botUrl.replace(/\/+$/,'')
      const r=await fetch(`${u}/api/bot?setup=1&token=${encodeURIComponent(tgTok)}&url=${encodeURIComponent(u)}`)
      const d=await r.json()
      if(d.ok){setBotSt(`✅ Бот подключён! Напиши /start`);await dbSaveSettings({tg_token:tgTok,tg_chat_id:tgChat})}
      else setBotSt('❌ '+(d.description||d.error||JSON.stringify(d)))
    }catch(e){setBotSt('❌ '+e.message)}
  }
  const reseedProducts=async()=>{t_('Загружаем...');localStorage.removeItem(SEED_KEY);for(let i=0;i<ALL_PRODUCTS.length;i+=20){await Promise.all(ALL_PRODUCTS.slice(i,i+20).map(p=>dbUpsertProduct(p)))}lsSet(SEED_KEY,'1');setProds(ALL_PRODUCTS);t_(`Загружено ${ALL_PRODUCTS.length} товаров`)}

  const logoClick=()=>{lc.current++;clearTimeout(lt.current);if(lc.current>=5){lc.current=0;setAdminOpen(true)}else lt.current=setTimeout(()=>{lc.current=0},2000)}
  const checkPw=()=>{if(pw==='admin11'){setAdminAuth(true);setPwErr(false);setPw('')}else{setPwErr(true);setTimeout(()=>setPwErr(false),1500);setPw('')}}

  const rev=allOrders.reduce((s,o)=>s+(o.total||0),0)
  const avg=allOrders.length?Math.round(rev/allOrders.length):0
  const a=accent
  const v={bg:'#f8fafc',w:'#fff',b1:'#e2e8f0',b2:'#f1f5f9',t1:'#0f172a',t2:'#475569',t3:'#94a3b8',ok:'#16a34a',err:'#dc2626'}

  const S={
    app:{maxWidth:480,margin:'0 auto',minHeight:'100vh',background:v.bg,fontFamily:"'Inter',-apple-system,sans-serif",color:v.t1},
    hdr:{position:'sticky',top:0,zIndex:100,background:'rgba(255,255,255,.96)',backdropFilter:'blur(12px)',borderBottom:`1px solid ${v.b1}`,padding:'0 14px'},
    hIn:{display:'flex',alignItems:'center',justifyContent:'space-between',height:52},
    hL:{display:'flex',alignItems:'center',gap:8},
    mBtn:{background:v.b2,border:'none',borderRadius:8,width:34,height:34,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:15,color:v.t2},
    logo:{display:'flex',alignItems:'center',gap:9,cursor:'pointer',userSelect:'none'},
    lIco:{width:30,height:30,background:a,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:12,color:'#fff',flexShrink:0},
    lTxt:{fontWeight:700,fontSize:15,color:v.t1},
    cBtn:{background:a,border:'none',borderRadius:9,padding:'6px 12px',display:'flex',alignItems:'center',gap:5,cursor:'pointer',fontSize:13,fontWeight:600,color:'#fff'},
    bdg:{background:'rgba(255,255,255,.3)',color:'#fff',borderRadius:20,padding:'0 6px',fontSize:11,fontWeight:700},
    sOvl:{position:'fixed',inset:0,background:'rgba(15,23,42,.4)',zIndex:200,backdropFilter:'blur(2px)'},
    sb:{position:'fixed',top:0,left:0,width:282,height:'100%',background:v.w,zIndex:201,overflowY:'auto',boxShadow:'4px 0 20px rgba(0,0,0,.1)',display:'flex',flexDirection:'column'},
    sbHd:{padding:'14px',borderBottom:`1px solid ${v.b2}`,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,background:v.w,zIndex:1},
    sbT:{fontWeight:700,fontSize:13,color:v.t1},
    sbX:{background:v.b2,border:'none',borderRadius:7,width:28,height:28,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',color:v.t2},
    // Категория в сайдбаре
    sbCat:(ac)=>({display:'flex',alignItems:'center',gap:8,padding:'9px 13px',cursor:'pointer',borderLeft:`3px solid ${ac?a:'transparent'}`,background:ac?`${a}08`:v.w}),
    sbCatIco:{fontSize:14,width:20,textAlign:'center'},
    sbCatName:(ac)=>({fontSize:12,fontWeight:ac?700:500,color:ac?a:v.t2,flex:1}),
    sbCatCnt:{fontSize:10,color:v.t3,background:v.b2,borderRadius:20,padding:'1px 7px'},
    sbCatArr:(o)=>({fontSize:8,color:v.t3,transition:'transform .2s',transform:o?'rotate(90deg)':'none',display:'inline-block'}),
    // Бренд в сайдбаре
    sbBrand:(ac)=>({display:'flex',alignItems:'center',gap:7,padding:'7px 13px 7px 40px',cursor:'pointer',background:ac?`${a}08`:v.bg,borderLeft:`3px solid ${ac?a:'transparent'}`}),
    sbBrandName:(ac)=>({fontSize:11,fontWeight:ac?700:500,color:ac?a:'#475569',flex:1}),
    sbBrandCnt:{fontSize:10,color:v.t3,flexShrink:0},
    // Хлебные крошки
    breadcrumb:{padding:'8px 14px',background:v.w,borderBottom:`1px solid ${v.b2}`,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'},
    bcItem:{fontSize:12,color:v.t3,cursor:'pointer'},
    bcSep:{fontSize:10,color:v.t3},
    bcActive:{fontSize:12,fontWeight:600,color:a},
    // Сетка брендов
    brandGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9},
    brandCard:{background:v.w,border:`1px solid ${v.b1}`,borderRadius:11,padding:'14px 12px',cursor:'pointer',textAlign:'center',boxShadow:'0 1px 3px rgba(0,0,0,.04)'},
    brandIco:{fontSize:28,marginBottom:6},
    brandName:{fontSize:12,fontWeight:700,color:v.t1,marginBottom:3},
    brandCnt:{fontSize:11,color:v.t3},
    // Каталог
    hero:{padding:'14px 14px 10px',background:v.w,borderBottom:`1px solid ${v.b2}`},
    hTag:{display:'inline-block',background:`${a}12`,color:a,borderRadius:5,padding:'3px 9px',fontSize:11,fontWeight:600,marginBottom:8},
    h1:{fontSize:18,fontWeight:700,lineHeight:1.25,marginBottom:4,color:v.t1},h1a:{color:a},hP:{fontSize:13,color:v.t2,lineHeight:1.6},
    srW:{padding:'9px 14px 7px',background:v.w,borderBottom:`1px solid ${v.b2}`},srB:{position:'relative'},
    srI:{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:v.t3,fontSize:13,pointerEvents:'none'},
    srIn:{width:'100%',background:v.b2,border:`1px solid ${v.b1}`,borderRadius:9,padding:'9px 14px 9px 34px',fontSize:14,color:v.t1,fontFamily:'inherit',outline:'none'},
    pW:{padding:'11px 14px 90px'},
    sH:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:11},
    sT:{fontSize:14,fontWeight:700,color:v.t1},sC:{fontSize:11,color:v.t3,background:v.b2,borderRadius:20,padding:'2px 9px',fontWeight:600},
    grid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9},
    card:{background:v.w,border:`1px solid ${v.b1}`,borderRadius:11,overflow:'hidden',cursor:'pointer',position:'relative',boxShadow:'0 1px 3px rgba(0,0,0,.04)'},
    cImg:{width:'100%',aspectRatio:'1',background:v.b2,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'},
    cBdy:{padding:'9px 9px 8px'},cBr:{fontSize:9,fontWeight:700,color:a,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:2},
    cNm:{fontSize:11,fontWeight:600,lineHeight:1.35,marginBottom:5,color:'#1e293b',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'},
    cMt:{display:'flex',alignItems:'center',justifyContent:'space-between'},
    cPr:{fontSize:13,fontWeight:700,color:v.t1},cPS:{fontSize:10,color:v.t3},cSk:{fontSize:9,color:v.t3,marginTop:2},
    addB:{width:26,height:26,background:a,border:'none',borderRadius:7,color:'#fff',fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0},
    iC:{position:'absolute',top:7,right:7,background:a,color:'#fff',borderRadius:20,padding:'2px 6px',fontSize:9,fontWeight:700},
    bn:{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,background:'rgba(255,255,255,.97)',backdropFilter:'blur(12px)',borderTop:`1px solid ${v.b1}`,zIndex:90,padding:'7px 0'},
    bIt:{display:'flex',justifyContent:'space-around'},bI:{display:'flex',flexDirection:'column',alignItems:'center',gap:2,cursor:'pointer',padding:'3px 16px'},
    bIc:(ac)=>({fontSize:19,opacity:ac?1:.4,filter:ac?`drop-shadow(0 0 4px ${a})`:'none'}),
    bLb:(ac)=>({fontSize:10,fontWeight:ac?700:500,color:ac?a:v.t3}),
    ovl:{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:200,backdropFilter:'blur(4px)'},
    mdl:{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,background:v.w,borderRadius:'18px 18px 0 0',zIndex:201,maxHeight:'92vh',overflowY:'auto'},
    mH:{width:30,height:4,background:v.b1,borderRadius:2,margin:'11px auto 0'},
    mHd:{padding:'13px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${v.b2}`},
    mT:{fontSize:16,fontWeight:700,color:v.t1},
    mC:{background:v.b2,border:'none',borderRadius:7,width:29,height:29,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',color:v.t2},
    cIt:{display:'flex',alignItems:'center',gap:11,padding:'10px 0',borderBottom:`1px solid ${v.b2}`},
    cIc:{width:40,height:40,background:v.b2,borderRadius:9,overflow:'hidden',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15},
    ciIn:{flex:1,minWidth:0},ciNm:{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#1e293b'},ciPr:{fontSize:12,fontWeight:700,color:a,marginTop:2},
    qR:{display:'flex',alignItems:'center',gap:7,flexShrink:0},
    qB:{width:27,height:27,background:v.b2,border:`1px solid ${v.b1}`,borderRadius:7,cursor:'pointer',fontSize:13,fontWeight:700,color:v.t2,display:'flex',alignItems:'center',justifyContent:'center'},
    qN:{fontSize:13,fontWeight:700,minWidth:18,textAlign:'center'},
    cFt:{padding:'13px 18px 22px',background:v.w,position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:480,zIndex:50,borderTop:`1px solid ${v.b2}`},
    tR:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:11},tL:{fontSize:13,color:v.t2},tV:{fontSize:19,fontWeight:700,color:v.t1},
    chB:{width:'100%',background:a,border:'none',borderRadius:11,padding:13,fontSize:14,fontWeight:700,color:'#fff',cursor:'pointer'},
    fW:{padding:'14px 18px 110px'},fG:{marginBottom:12},fL:{fontSize:12,fontWeight:600,color:v.t2,marginBottom:5,display:'block'},
    fI:{width:'100%',background:v.b2,border:`1px solid ${v.b1}`,borderRadius:9,padding:'10px 13px',fontSize:14,color:v.t1,fontFamily:'inherit',outline:'none'},
    dlvRow:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:12},
    dlvOpt:(sel)=>({border:`2px solid ${sel?a:v.b1}`,borderRadius:11,padding:'11px 9px',cursor:'pointer',textAlign:'center',background:sel?`${a}08`:v.b2,transition:'all .15s'}),
    dlvIco:{fontSize:19,marginBottom:3},dlvNm:{fontSize:12,fontWeight:700,color:v.t1,marginBottom:1},dlvSb:{fontSize:10,color:v.t3},
    sB:(ld)=>({width:'100%',background:ld?v.b1:a,border:'none',borderRadius:11,padding:13,fontSize:14,fontWeight:700,color:ld?v.t3:'#fff',cursor:ld?'not-allowed':'pointer'}),
    sumBox:{background:v.b2,border:`1px solid ${v.b1}`,borderRadius:11,padding:12,marginBottom:13},
    sucW:{padding:'36px 18px',textAlign:'center',minHeight:'80vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'},
    mgCard:{background:v.b2,border:`1px solid ${v.b1}`,borderRadius:13,padding:14,marginBottom:18,display:'flex',alignItems:'center',gap:11,textAlign:'left'},
    okB:{background:v.b2,border:`1px solid ${v.b1}`,borderRadius:11,padding:11,fontSize:13,fontWeight:600,color:v.t2,cursor:'pointer',width:'100%'},
    pdI:{width:'100%',aspectRatio:'1.2',background:v.b2,borderRadius:11,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:13,overflow:'hidden'},
    pdP:{fontSize:24,fontWeight:700,marginBottom:16,color:v.t1},
    pdB:{width:'100%',background:a,border:'none',borderRadius:11,padding:13,fontSize:14,fontWeight:700,color:'#fff',cursor:'pointer'},
    tst:(t)=>({position:'fixed',top:62,left:'50%',transform:'translateX(-50%)',background:'#0f172a',borderRadius:9,padding:'8px 14px',fontSize:12,fontWeight:600,color:t==='err'?'#fca5a5':'#86efac',zIndex:500,whiteSpace:'nowrap',pointerEvents:'none',boxShadow:'0 4px 16px rgba(0,0,0,.2)'}),
    bnr:{position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',width:'calc(100% - 28px)',maxWidth:448,background:a,borderRadius:11,padding:'10px 14px',zIndex:150},
    adO:{position:'fixed',inset:0,background:'rgba(15,23,42,.5)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'},
    adP:{background:v.w,width:'100%',maxWidth:480,borderRadius:'18px 18px 0 0',maxHeight:'95vh',overflowY:'auto',position:'relative'},
    adC:{position:'absolute',top:12,right:12,background:v.b2,border:'none',borderRadius:7,width:28,height:28,cursor:'pointer',color:v.t2,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',zIndex:10},
    aTs:{display:'flex',borderBottom:`1px solid ${v.b2}`,overflowX:'auto',scrollbarWidth:'none'},
    aTb:(ac)=>({flexShrink:0,padding:'10px 12px',fontSize:12,fontWeight:ac?700:500,color:ac?a:v.t3,cursor:'pointer',borderBottom:`2px solid ${ac?a:'transparent'}`,whiteSpace:'nowrap'}),
    aSc:{padding:14},aGr:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9,marginBottom:14},
    aCd:{background:v.b2,border:`1px solid ${v.b1}`,borderRadius:11,padding:12},
    aN:{fontSize:19,fontWeight:700,marginBottom:3,color:v.t1},aLb:{fontSize:10,color:v.t3,fontWeight:600,textTransform:'uppercase',letterSpacing:'.07em'},
    aFL:{fontSize:11,fontWeight:700,color:v.t2,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:5,marginTop:12,display:'block'},
    aIn:{width:'100%',background:v.b2,border:`1px solid ${v.b1}`,borderRadius:9,padding:'9px 11px',fontSize:13,color:v.t1,fontFamily:'inherit',outline:'none',marginBottom:4},
    aTA:{width:'100%',background:v.b2,border:`1px solid ${v.b1}`,borderRadius:9,padding:'9px 11px',fontSize:13,color:v.t1,fontFamily:'inherit',outline:'none',resize:'vertical',minHeight:72,marginBottom:4},
    aBt:{background:a,border:'none',borderRadius:9,padding:'10px 14px',fontSize:12,fontWeight:700,color:'#fff',cursor:'pointer',marginTop:7,width:'100%'},
    aBtSm:{background:a,border:'none',borderRadius:9,padding:'8px 12px',fontSize:11,fontWeight:700,color:'#fff',cursor:'pointer'},
    aBtGray:{background:'#64748b',border:'none',borderRadius:9,padding:'8px 12px',fontSize:11,fontWeight:700,color:'#fff',cursor:'pointer'},
    aBtWarn:{background:'#f59e0b',border:'none',borderRadius:9,padding:'9px 14px',fontSize:12,fontWeight:700,color:'#fff',cursor:'pointer',marginTop:7,width:'100%'},
    aBS:{background:v.b2,border:`1px solid ${v.b1}`,borderRadius:9,padding:'7px 12px',fontSize:12,fontWeight:600,color:v.t2,cursor:'pointer'},
    tgS:(s)=>({display:'flex',alignItems:'center',gap:7,fontSize:12,fontWeight:600,padding:'7px 11px',background:v.b2,borderRadius:9,marginBottom:9,color:s==='ok'?v.ok:s==='error'?v.err:v.t2}),
    tgD:(s)=>({width:7,height:7,borderRadius:'50%',background:s==='ok'?'#22c55e':s==='error'?'#ef4444':'#f59e0b',flexShrink:0}),
    pRw:{display:'flex',alignItems:'center',gap:8,padding:'8px 0',borderBottom:`1px solid ${v.b2}`},
    pIc:{width:36,height:36,background:v.b2,borderRadius:7,overflow:'hidden',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15},
    pIn:{flex:1,minWidth:0},pNm:{fontSize:12,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#1e293b'},pPr:{fontSize:11,color:a,fontWeight:600},
    pAc:{display:'flex',gap:5,flexShrink:0},iB:(d)=>({width:26,height:26,borderRadius:6,border:`1px solid ${v.b1}`,background:v.b2,cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',color:d?'#ef4444':v.t2}),
    mD:{fontSize:32,fontWeight:700,color:a,textAlign:'center',padding:'11px 0'},rng:{width:'100%',accentColor:a,cursor:'pointer'},
    pIt:{background:v.b2,border:`1px solid ${v.b1}`,borderRadius:8,padding:'8px 11px',marginBottom:6},
    oIt:{background:v.b2,border:`1px solid ${v.b1}`,borderRadius:11,padding:11,marginBottom:8},
    uIt:{background:v.b2,border:`1px solid ${v.b1}`,borderRadius:11,padding:11,marginBottom:8},
    div:{height:1,background:v.b2,margin:'11px 0'},
    clr:{width:'100%',background:v.b2,border:`1px solid ${v.b1}`,borderRadius:9,padding:'5px 11px',height:38,cursor:'pointer',marginBottom:4},
    infoBox:{background:`${a}10`,border:`1px solid ${a}22`,borderRadius:9,padding:'8px 11px',fontSize:12,color:a,lineHeight:1.6,marginBottom:11},
    sOk:{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:9,padding:'8px 11px',fontSize:12,color:v.ok,marginTop:8},
    sErr:{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:9,padding:'8px 11px',fontSize:12,color:v.err,marginTop:8},
    mkBox:{background:v.b2,border:`1px solid ${v.b1}`,borderRadius:11,padding:12,marginBottom:12,display:'flex',justifyContent:'space-between',alignItems:'center'},
  }

  if(loading||seeding)return(<div style={{...S.app,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:11,minHeight:'100vh'}}><div style={{fontSize:38}}>💨</div><div style={{fontSize:18,fontWeight:700,color:a}}>Ways Pod</div><div style={{fontSize:13,color:v.t3}}>{seeding?'Загружаем товары...':'Загрузка...'}</div></div>)

  const showNav=screen==='catalog'&&!detail

  return(<div style={S.app}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#f8fafc;font-family:'Inter',-apple-system,sans-serif}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px}input,textarea{font-family:inherit}`}</style>

    {toast&&<div style={S.tst(toast.type)}>{toast.msg}</div>}
    {banner&&<div style={S.bnr}><div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.7)',textTransform:'uppercase',marginBottom:2}}>📢 {sName}</div><div style={{fontSize:13,fontWeight:600,color:'#fff'}}>{banner}</div></div>}

    {/* HEADER */}
    <div style={S.hdr}><div style={S.hIn}>
      <div style={S.hL}>
        <button style={S.mBtn} onClick={()=>setSideOpen(true)}>☰</button>
        <div style={S.logo} onClick={()=>{setScreen('catalog');setNav('catalog');setCat('Все');setSelBrand('');setSearch('');logoClick()}}>
          <div style={S.lIco}>{logo}</div>
          <div style={S.lTxt}>{sName}</div>
        </div>
      </div>
      <button style={S.cBtn} onClick={()=>setScreen('cart')}>🛒 <span style={S.bdg}>{cc}</span></button>
    </div></div>

    {/* ─── SIDEBAR — 2 уровня ─── */}
    {sideOpen&&(<>
      <div style={S.sOvl} onClick={()=>setSideOpen(false)}/>
      <div style={S.sb}>
        <div style={S.sbHd}>
          <span style={S.sbT}>📂 Каталог</span>
          <button style={S.sbX} onClick={()=>setSideOpen(false)}>✕</button>
        </div>
        {/* Все товары */}
        <div style={S.sbCat(cat==='Все')} onClick={()=>{setCat('Все');setSelBrand('');setSearch('');setSideOpen(false);setNav('catalog');setScreen('catalog')}}>
          <span style={S.sbCatIco}>🏷️</span>
          <span style={S.sbCatName(cat==='Все')}>Все товары</span>
          <span style={S.sbCatCnt}>{prods.length}</span>
        </div>
        {/* Категории */}
        {Object.entries(catTree).map(([cn, brands])=>{
          const io=openCats[cn]; const ia=cat===cn
          const totalInCat=Object.values(brands).flat().length
          return(<div key={cn}>
            {/* Заголовок категории */}
            <div style={{...S.sbCat(ia&&!io), justifyContent:'space-between'}}
              onClick={()=>setOpenCats(p=>({...p,[cn]:!io}))}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={S.sbCatIco}>{CAT_ICONS[cn]||'📦'}</span>
                <span style={S.sbCatName(ia)}>{cn}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={S.sbCatCnt}>{totalInCat}</span>
                <span style={S.sbCatArr(io)}>▶</span>
              </div>
            </div>
            {/* Бренды внутри категории */}
            {io&&(<div>
              {/* Показать все в категории */}
              <div style={{padding:'6px 13px 6px 13px',cursor:'pointer',background:`${a}06`,borderLeft:`3px solid ${a}25`}}
                onClick={()=>{setCat(cn);setSelBrand('');setSideOpen(false);setNav('catalog');setScreen('catalog')}}>
                <span style={{fontSize:11,fontWeight:700,color:a}}>Все в разделе ({totalInCat})</span>
              </div>
              {/* Список брендов */}
              {Object.entries(brands).sort((a,b)=>a[0].localeCompare(b[0],'ru')).map(([br, bprods])=>(
                <div key={br} style={S.sbBrand(cat===cn&&selBrand===br)}
                  onClick={()=>{setCat(cn);setSelBrand(br);setSideOpen(false);setNav('catalog');setScreen('catalog')}}>
                  <span style={S.sbBrandName(cat===cn&&selBrand===br)}>{br}</span>
                  <span style={S.sbBrandCnt}>{bprods.length}</span>
                </div>
              ))}
            </div>)}
          </div>)
        })}
      </div>
    </>)}

    {/* ─── CATALOG ─── */}
    {nav==='catalog'&&screen==='catalog'&&(<>
      {/* Hero — показываем только когда нет выбранной категории */}
      {cat==='Все'&&!selBrand&&!search&&(
        <div style={S.hero}>
          <div style={S.hTag}>B2B · Оптовые поставки</div>
          <h1 style={S.h1}>{sName} — <span style={S.h1a}>оптовый склад</span></h1>
          <p style={S.hP}>{sDesc}</p>
        </div>
      )}
      {/* Поиск */}
      <div style={S.srW}><div style={S.srB}>
        <span style={S.srI}>🔍</span>
        <input style={S.srIn} placeholder="Поиск по названию, бренду, артикулу..." value={search} onChange={e=>{setSearch(e.target.value);setCat('Все');setSelBrand('')}}/>
      </div></div>

      {/* Хлебные крошки */}
      {(cat!=='Все'||selBrand||search)&&(
        <div style={S.breadcrumb}>
          <span style={S.bcItem} onClick={()=>{setCat('Все');setSelBrand('');setSearch('')}}>Все товары</span>
          {cat!=='Все'&&<><span style={S.bcSep}>›</span><span style={selBrand?S.bcItem:S.bcActive} onClick={()=>setSelBrand('')}>{cat}</span></>}
          {selBrand&&<><span style={S.bcSep}>›</span><span style={S.bcActive}>{selBrand}</span></>}
          {search&&<><span style={S.bcSep}>›</span><span style={S.bcActive}>«{search}»</span></>}
        </div>
      )}

      <div style={S.pW}>
        {/* Показываем бренды если выбрана категория но не бренд */}
        {!search&&cat!=='Все'&&!selBrand?(
          <>
            <div style={S.sH}>
              <div style={S.sT}>{cat}</div>
              <div style={S.sC}>{Object.values(catTree[cat]||{}).flat().length} шт</div>
            </div>
            <div style={S.brandGrid}>
              {Object.entries(catTree[cat]||{}).sort((a,b)=>a[0].localeCompare(b[0],'ru')).map(([br,bprods])=>(
                <div key={br} style={S.brandCard} onClick={()=>setSelBrand(br)}>
                  <div style={S.brandIco}>{bprods[0]?.emoji||'📦'}</div>
                  <div style={S.brandName}>{br}</div>
                  <div style={S.brandCnt}>{bprods.length} товаров</div>
                </div>
              ))}
            </div>
          </>
        ) : (
          // Показываем товары
          <>
            <div style={S.sH}>
              <div style={S.sT}>
                {search?`Поиск: «${search}»`:selBrand?selBrand:cat==='Все'?'Все товары':cat}
              </div>
              <div style={S.sC}>{
                search?filtered.length:
                selBrand?filtered.length:
                cat==='Все'?prods.length:0
              } шт</div>
            </div>
            {(search||selBrand||cat==='Все')&&(
              filtered.length===0
                ?<div style={{textAlign:'center',padding:'40px 16px',color:v.t3}}><div style={{fontSize:36,marginBottom:9}}>🔍</div><div>Ничего не найдено</div></div>
                :<div style={S.grid}>{filtered.map(p=>(
                  <div key={p.id} style={S.card} onClick={()=>setDetail(p)}>
                    {cart[p.id]?.qty>0&&<div style={S.iC}>×{cart[p.id].qty}</div>}
                    <div style={S.cImg}><Img src={p.photo} emoji={p.emoji} size={32}/></div>
                    <div style={S.cBdy}>
                      <div style={S.cBr}>{p.brand||p.cat}</div>
                      <div style={S.cNm}>{p.name}</div>
                      <div style={S.cMt}>
                        <div><div style={S.cPr}>{gp(p.price)}<span style={S.cPS}> ₽{p.unit?'/'+p.unit:''}</span></div><div style={S.cSk}>#{p.sku}</div></div>
                        <button style={S.addB} onClick={e=>{e.stopPropagation();addCart(p.id)}}>+</button>
                      </div>
                    </div>
                  </div>
                ))}</div>
            )}
          </>
        )}
      </div>
    </>)}

    {nav==='orders'&&screen==='catalog'&&(
      <div style={{padding:'18px 14px 90px'}}>
        <h2 style={{fontSize:17,fontWeight:700,marginBottom:4}}>Мои заказы</h2>
        <p style={{fontSize:12,color:v.t3,marginBottom:14}}>История ваших заказов</p>
        {orders.length===0
          ?<div style={{textAlign:'center',padding:'40px 0',color:v.t3}}><div style={{fontSize:36,marginBottom:9}}>📦</div><div>Заказов пока нет</div></div>
          :orders.map(o=><div key={o.id} style={S.oIt}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:11,fontWeight:700,color:a}}>#{o.id}</span><span style={{fontSize:10,color:v.t3}}>{new Date(o.created_at).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'})}</span></div>
            <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{o.name}</div>
            <div style={{fontSize:11,color:v.t3,marginBottom:4}}>{o.delivery_type==='sdek'?'📦 СДЭК':'📮 Почта'}: {o.delivery_addr}</div>
            <div style={{fontSize:11,color:v.t3,marginBottom:5}}>{(o.items||[]).length} позиций</div>
            <div style={{fontSize:13,color:v.ok,fontWeight:700}}>{(o.total||0).toLocaleString('ru')} ₽</div>
          </div>)
        }
      </div>
    )}

    {nav==='about'&&screen==='catalog'&&(
      <div style={{padding:'18px 14px 90px'}}>
        <h2 style={{fontSize:17,fontWeight:700,marginBottom:14}}>О нас</h2>
        <div style={{background:v.w,border:`1px solid ${v.b1}`,borderRadius:12,padding:16,marginBottom:11}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:9}}>{sName}</div>
          <div style={{fontSize:13,color:v.t2,lineHeight:1.7,whiteSpace:'pre-wrap'}}>{aboutTxt}</div>
        </div>
        <div style={{background:v.w,border:`1px solid ${v.b1}`,borderRadius:12,padding:16}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:11}}>Менеджер</div>
          <a href={mgrLink} target="_blank" rel="noopener noreferrer" style={{display:'flex',alignItems:'center',gap:11,textDecoration:'none'}}>
            <div style={{width:42,height:42,background:a,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,color:'#fff',flexShrink:0}}>💬</div>
            <div><div style={{fontWeight:700,fontSize:14,color:v.t1}}>{mgrN}</div><div style={{fontSize:12,color:a}}>{mgrLink}</div></div>
          </a>
        </div>
      </div>
    )}

    {screen==='cart'&&(
      <div style={{paddingBottom:ci.length>0?110:0}}>
        <div style={{padding:'13px 18px',display:'flex',alignItems:'center',gap:11,borderBottom:`1px solid ${v.b2}`,background:v.w}}>
          <button style={S.mC} onClick={()=>setScreen('catalog')}>←</button>
          <div style={S.mT}>Корзина</div>
        </div>
        <div style={{padding:'0 18px',background:v.w}}>
          {ci.length===0
            ?<div style={{textAlign:'center',padding:'40px 0',color:v.t3}}><div style={{fontSize:36,marginBottom:9}}>🛒</div><div>Корзина пуста</div></div>
            :ci.map(i=><div key={i.id} style={S.cIt}>
              <div style={S.cIc}><Img src={i.photo||prods.find(p=>p.id===i.id)?.photo} emoji={i.emoji} size={15}/></div>
              <div style={S.ciIn}><div style={S.ciNm}>{i.name}</div><div style={S.ciPr}>{(i.price*i.qty).toLocaleString('ru')} ₽</div></div>
              <div style={S.qR}>
                <button style={S.qB} onClick={()=>chQ(i.id,-1)}>−</button>
                <span style={S.qN}>{i.qty}</span>
                <button style={S.qB} onClick={()=>chQ(i.id,1)}>+</button>
              </div>
            </div>)
          }
        </div>
        {ci.length>0&&<div style={S.cFt}>
          <div style={S.tR}><div style={S.tL}>Итого</div><div style={S.tV}>{ct.toLocaleString('ru')} ₽</div></div>
          <button style={S.chB} onClick={()=>setScreen('checkout')}>Оформить заказ</button>
        </div>}
      </div>
    )}

    {screen==='checkout'&&(
      <div>
        <div style={{padding:'13px 18px',display:'flex',alignItems:'center',gap:11,borderBottom:`1px solid ${v.b2}`,background:v.w}}>
          <button style={S.mC} onClick={()=>setScreen('cart')}>←</button>
          <div style={S.mT}>Оформление заказа</div>
        </div>
        <div style={S.fW}>
          <div style={{fontWeight:700,fontSize:11,color:v.t3,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:11}}>Контактные данные</div>
          <div style={S.fG}><label style={S.fL}>Номер телефона *</label><input style={S.fI} type="tel" placeholder="+7 999 000 00 00" value={form.phone} onChange={e=>updateForm('phone',e.target.value)}/></div>
          <div style={S.fG}><label style={S.fL}>Ваше имя или название компании *</label><input style={S.fI} type="text" placeholder="Иван Иванов / ООО Ромашка" value={form.name} onChange={e=>updateForm('name',e.target.value)}/></div>
          <div style={{fontWeight:700,fontSize:11,color:v.t3,textTransform:'uppercase',letterSpacing:'.05em',marginBottom:11,marginTop:4}}>Способ доставки</div>
          <div style={S.dlvRow}>
            <div style={S.dlvOpt(form.delivery==='sdek')} onClick={()=>updateForm('delivery','sdek')}>
              <div style={S.dlvIco}>📦</div><div style={S.dlvNm}>СДЭК</div><div style={S.dlvSb}>Быстрая доставка</div>
            </div>
            <div style={S.dlvOpt(form.delivery==='pochta')} onClick={()=>updateForm('delivery','pochta')}>
              <div style={S.dlvIco}>📮</div><div style={S.dlvNm}>Почта России</div><div style={S.dlvSb}>По всей России</div>
            </div>
          </div>
          <div style={S.fG}>
            <label style={S.fL}>{form.delivery==='sdek'?'Адрес отделения СДЭК *':'Адрес почтового отделения *'}</label>
            <input style={S.fI} type="text" placeholder={form.delivery==='sdek'?'г. Москва, ул. Примерная, СДЭК №123':'г. Москва, ул. Примерная, Почта 101000'} value={form.addr} onChange={e=>updateForm('addr',e.target.value)}/>
          </div>
          <div style={S.sumBox}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:12,color:v.t2}}>Позиций</span><span style={{fontSize:12,fontWeight:600}}>{ci.length}</span></div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,color:v.t2}}>Итого</span><span style={{fontSize:17,fontWeight:700,color:a}}>{ct.toLocaleString('ru')} ₽</span></div>
          </div>
          <button style={S.sB(busy)} onClick={submitOrder} disabled={busy}>{busy?'⏳ Оформляем...':'Подтвердить заказ'}</button>
        </div>
      </div>
    )}

    {screen==='success'&&(
      <div style={S.sucW}>
        <div style={{fontSize:52,marginBottom:14}}>🎉</div>
        <h3 style={{fontSize:20,fontWeight:700,marginBottom:7}}>Заказ оформлен!</h3>
        <p style={{fontSize:13,color:v.t2,lineHeight:1.6,marginBottom:20,maxWidth:280}}>Менеджер свяжется с вами в ближайшее время.</p>
        <div style={S.mgCard}>
          <div style={{width:40,height:40,background:a,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,color:'#fff',flexShrink:0}}>💬</div>
          <div><div style={{fontWeight:700,fontSize:13,color:v.t1}}>{mgrN}</div><a href={mgrLink} target="_blank" rel="noopener noreferrer" style={{fontSize:12,color:a,textDecoration:'none'}}>{mgrLink}</a></div>
        </div>
        <button style={S.okB} onClick={()=>{setScreen('catalog');setNav('catalog')}}>Вернуться в каталог</button>
      </div>
    )}

    {detail&&(<>
      <div style={S.ovl} onClick={()=>setDetail(null)}/>
      <div style={S.mdl}>
        <div style={S.mH}/>
        <div style={S.mHd}><div style={S.mT}>Товар</div><button style={S.mC} onClick={()=>setDetail(null)}>✕</button></div>
        <div style={{padding:'14px 18px 28px'}}>
          <div style={S.pdI}><Img src={detail.photo} emoji={detail.emoji} size={68}/></div>
          <div style={{fontSize:10,fontWeight:700,color:a,textTransform:'uppercase',letterSpacing:'.07em',marginBottom:5}}>{detail.brand||detail.cat}</div>
          <div style={{fontSize:18,fontWeight:700,marginBottom:7,lineHeight:1.25,color:v.t1}}>{detail.name}</div>
          <div style={{fontSize:11,color:v.t3,marginBottom:12}}>Арт: {detail.sku} · {detail.cat}</div>
          <div style={S.pdP}>{gp(detail.price)}<span style={{fontSize:13,color:v.t3}}> ₽{detail.unit?'/'+detail.unit:''}</span></div>
          <button style={S.pdB} onClick={()=>{addCart(detail.id);setDetail(null)}}>В корзину</button>
        </div>
      </div>
    </>)}

    {showNav&&<div style={S.bn}><div style={S.bIt}>
      {[{k:'catalog',i:'🏪',l:'Каталог'},{k:'orders',i:'📦',l:'Заказы'},{k:'about',i:'ℹ️',l:'О нас'}].map(n=>(
        <div key={n.k} style={S.bI} onClick={()=>setNav(n.k)}>
          <div style={S.bIc(n.k===nav)}>{n.i}</div>
          <div style={S.bLb(n.k===nav)}>{n.l}</div>
        </div>
      ))}
    </div></div>}

    {/* ADMIN */}
    {adminOpen&&(
      <div style={S.adO}>
        <div style={S.adP}>
          <button style={S.adC} onClick={()=>setAdminOpen(false)}>✕</button>
          {!adminAuth?(
            <div style={{padding:'32px 22px 44px',textAlign:'center'}}>
              <div style={{fontSize:42,marginBottom:13}}>🔐</div>
              <h2 style={{fontSize:19,fontWeight:700,marginBottom:7}}>Панель управления</h2>
              <p style={{fontSize:13,color:v.t3,marginBottom:22}}>Ways Pod · Закрытый доступ</p>
              <input style={{...S.aIn,textAlign:'center',letterSpacing:'.15em',fontSize:16,marginBottom:11,border:`1px solid ${pwErr?'#fca5a5':v.b1}`}} type="password" placeholder="••••••••" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&checkPw()}/>
              {pwErr&&<div style={{color:v.err,fontSize:12,marginBottom:9}}>Неверный пароль</div>}
              <button style={S.aBt} onClick={checkPw}>Войти</button>
            </div>
          ):(
            <>
              <div style={{padding:'13px 14px',borderBottom:`1px solid ${v.b2}`,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{fontWeight:700,fontSize:15}}>⚙️ Панель управления</div>
                <button style={S.aBS} onClick={()=>{setAdminAuth(false);setAdminOpen(false)}}>Выйти</button>
              </div>
              <div style={S.aTs}>
                {[['analytics','📊'],['products','📦'],['orders','🧾'],['users','👥'],['telegram','✈️'],['push','📢'],['markup','💰'],['settings','🔧']].map(([k,i])=>(
                  <div key={k} style={S.aTb(aTab===k)} onClick={()=>setATab(k)}>{i}</div>
                ))}
              </div>

              {aTab==='analytics'&&<div style={S.aSc}>
                <div style={S.aGr}>{[['Заказов',allOrders.length],['Выручка',rev.toLocaleString('ru')+'₽'],['Клиентов',new Set(allOrders.map(o=>o.phone)).size],['Ср. чек',avg.toLocaleString('ru')+'₽']].map(([l,val])=>(
                  <div key={l} style={S.aCd}><div style={{...S.aN,color:a}}>{val}</div><div style={S.aLb}>{l}</div></div>
                ))}</div>
                <span style={S.aFL}>Последние заказы</span>
                {allOrders.slice(0,10).map(o=>(
                  <div key={o.id} style={S.oIt}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:11,fontWeight:700,color:a}}>#{o.id}</span><span style={{fontSize:10,color:v.t3}}>{new Date(o.created_at).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'})}</span></div>
                    <div style={{fontWeight:600,fontSize:12,marginBottom:2}}>{o.name}</div>
                    <div style={{fontSize:11,color:v.t3,marginBottom:3}}>📞 {o.phone}</div>
                    <div style={{fontSize:11,color:v.t3,marginBottom:4}}>{o.delivery_type==='sdek'?'📦 СДЭК':'📮 Почта'}: {o.delivery_addr}</div>
                    <div style={{fontSize:13,color:v.ok,fontWeight:700}}>{(o.total||0).toLocaleString('ru')} ₽</div>
                  </div>
                ))}
              </div>}

              {aTab==='products'&&<div style={S.aSc}>
                <div style={{display:'flex',gap:7,marginBottom:11,flexWrap:'wrap'}}>
                  <button style={S.aBtSm} onClick={newP}>+ Добавить</button>
                  <button style={S.aBtGray} onClick={reseedProducts}>🔄 Загрузить все {ALL_PRODUCTS.length}</button>
                </div>
                <div style={{fontSize:11,color:v.t3,marginBottom:8}}>В базе: {prods.length} товаров</div>
                <div>{prods.map(p=>(
                  <div key={p.id} style={S.pRw}>
                    <div style={S.pIc}><Img src={p.photo} emoji={p.emoji} size={14}/></div>
                    <div style={S.pIn}><div style={S.pNm}>{p.name}</div><div style={S.pPr}>{gp(p.price)} ₽{p.unit?'/'+p.unit:''}</div></div>
                    <div style={S.pAc}><button style={S.iB(false)} onClick={()=>editP(p)}>✏️</button><button style={S.iB(true)} onClick={()=>delP(p.id)}>🗑</button></div>
                  </div>
                ))}</div>
              </div>}

              {aTab==='orders'&&<div style={S.aSc}>
                {allOrders.length===0?<div style={{fontSize:12,color:v.t3}}>Заказов пока нет</div>:allOrders.map(o=>(
                  <div key={o.id} style={S.oIt}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:11,fontWeight:700,color:a}}>#{o.id}</span><span style={{fontSize:10,color:v.t3}}>{new Date(o.created_at).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'})}</span></div>
                    <div style={{fontWeight:600,fontSize:12,marginBottom:2}}>{o.name}</div>
                    <div style={{fontSize:11,color:v.t3,marginBottom:2}}>📞 {o.phone}</div>
                    <div style={{fontSize:11,color:v.t3,marginBottom:4}}>{o.delivery_type==='sdek'?'📦 СДЭК':'📮 Почта'}: {o.delivery_addr}</div>
                    {Array.isArray(o.items)&&<div style={{fontSize:11,color:v.t3,marginBottom:5}}>{o.items.map(i=>i.name+'×'+i.qty).join(', ')}</div>}
                    <div style={{fontSize:13,color:v.ok,fontWeight:700}}>{(o.total||0).toLocaleString('ru')} ₽</div>
                  </div>
                ))}
              </div>}

              {aTab==='users'&&<div style={S.aSc}>
                <div style={{fontSize:11,color:v.t3,marginBottom:11}}>Всего: {users.length}</div>
                {users.map(u=>{const uo=allOrders.filter(o=>o.phone===u.phone);const ut=uo.reduce((s,o)=>s+(o.total||0),0);return(
                  <div key={u.phone} style={S.uIt}>
                    <div style={{fontWeight:600,fontSize:13,marginBottom:3}}>{u.name||'—'}</div>
                    <div style={{fontSize:11,color:v.t3,marginBottom:2}}>📞 {u.phone}</div>
                    <div style={{fontSize:11,color:v.t3,marginBottom:5}}>📅 {new Date(u.created_at).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'})} МСК</div>
                    <div style={{display:'flex',gap:11}}><span style={{fontSize:12,color:a,fontWeight:600}}>🧾 {uo.length}</span><span style={{fontSize:12,color:v.ok,fontWeight:600}}>💰 {ut.toLocaleString('ru')} ₽</span></div>
                  </div>
                )})}
              </div>}

              {aTab==='telegram'&&<div style={S.aSc}>
                <div style={S.tgS(tgSt)}><div style={S.tgD(tgSt)}/>{tgSt==='ok'?`✅ ${tgBot}`:tgSt==='error'?'❌ Ошибка':'⚪ Не проверен'}</div>
                <div style={S.infoBox}>
                  1. Введи токен и Chat ID → «Сохранить»<br/>
                  2. Введи URL сайта → «Подключить бота»<br/>
                  3. Напиши боту /start — inline кнопки<br/>
                  4. При заказе — уведомление + PDF автоматически
                </div>
                <span style={S.aFL}>Токен бота (@BotFather)</span>
                <input style={S.aIn} placeholder="123456789:AAF..." value={tgTok} onChange={e=>setTgTok(e.target.value)}/>
                <span style={S.aFL}>Chat ID</span>
                <input style={S.aIn} placeholder="-1001234567890" value={tgChat} onChange={e=>setTgChat(e.target.value)}/>
                <button style={S.aBt} onClick={async()=>{await checkTg();const okTg=await dbSaveSettings({tg_token:tgTok,tg_chat_id:tgChat})
    if(okTg)t_('Telegram настройки сохранены ✓')
    else t_('Ошибка сохранения','err')}}>Проверить и сохранить</button>
                <div style={S.div}/>
                <span style={S.aFL}>URL сайта на Vercel</span>
                <input style={S.aIn} placeholder="https://ways-store.vercel.app" value={botUrl} onChange={e=>setBotUrl(e.target.value)}/>
                <button style={S.aBt} onClick={setupBot}>🤖 Подключить бота 24/7</button>
                {botSt&&<div style={botSt.startsWith('✅')?S.sOk:S.sErr}>{botSt}</div>}
                <div style={S.div}/>
                <span style={S.aFL}>Имя менеджера</span>
                <input style={S.aIn} value={mgrN} onChange={e=>setMgrN(e.target.value)}/>
                <span style={S.aFL}>Ссылка на менеджера в Telegram</span>
                <input style={S.aIn} placeholder="https://t.me/username" value={mgrLink} onChange={e=>setMgrLink(e.target.value)}/>
                <button style={S.aBt} onClick={async()=>{const okM=await dbSaveSettings({manager_name:mgrN,manager_link:mgrLink})
    if(okM)t_('Менеджер сохранён ✓')
    else t_('Ошибка сохранения','err')}}>Сохранить менеджера</button>
              </div>}

              {aTab==='push'&&<div style={S.aSc}>
                <span style={S.aFL}>Текст рассылки</span>
                <textarea style={S.aTA} placeholder="Сообщение для пользователей..." value={pushTxt} onChange={e=>setPushTxt(e.target.value)}/>
                <button style={S.aBt} onClick={sendPush}>📢 Отправить</button>
                <span style={{...S.aFL,marginTop:18}}>История</span>
                {push.length===0?<div style={{fontSize:12,color:v.t3}}>Пусто</div>:push.map((p,i)=>(
                  <div key={i} style={S.pIt}><div style={{fontSize:12,fontWeight:600,marginBottom:3}}>{p.text}</div><div style={{fontSize:10,color:v.t3}}>{new Date(p.created_at).toLocaleString('ru-RU',{timeZone:'Europe/Moscow'})}</div></div>
                ))}
              </div>}

              {aTab==='markup'&&<div style={S.aSc}>
                {/* Текущая и предыдущая наценка */}
                <div style={S.mkBox}>
                  <div>
                    <div style={{fontSize:11,color:v.t3,marginBottom:2}}>Текущая наценка</div>
                    <div style={{fontSize:22,fontWeight:700,color:a}}>{markup}%</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:11,color:v.t3,marginBottom:2}}>Предыдущая</div>
                    <div style={{fontSize:18,fontWeight:600,color:v.t2}}>{mkPrev}%</div>
                  </div>
                </div>
                <button style={S.aBtWarn} onClick={rollbackMarkup}>↩️ Откатить к {mkPrev}%</button>
                <div style={S.div}/>
                <div style={S.mD}>{mkVal}%</div>
                <input type="range" style={S.rng} min={0} max={100} value={Math.min(mkVal,100)} onChange={e=>setMkVal(parseInt(e.target.value))}/>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:v.t3,marginTop:3,marginBottom:11}}><span>0%</span><span>50%</span><span>100%</span></div>
                <span style={S.aFL}>Вручную (%)</span>
                <input style={S.aIn} type="number" min={0} max={500} value={mkVal} onChange={e=>setMkVal(parseInt(e.target.value)||0)}/>
                <button style={S.aBt} onClick={()=>applyMarkup(mkVal)}>Применить и сохранить</button>
              </div>}

              {aTab==='settings'&&<div style={S.aSc}>
                <span style={S.aFL}>Название сайта</span><input style={S.aIn} value={sName} onChange={e=>setSName(e.target.value)}/>
                <span style={S.aFL}>Описание</span><input style={S.aIn} value={sDesc} onChange={e=>setSDesc(e.target.value)}/>
                <span style={S.aFL}>Текст «О нас»</span><textarea style={S.aTA} rows={5} value={aboutTxt} onChange={e=>setAboutTxt(e.target.value)}/>
                <span style={S.aFL}>Логотип (макс. 3 символа)</span><input style={S.aIn} value={logo} maxLength={3} onChange={e=>setLogo(e.target.value)}/>
                <span style={S.aFL}>Цвет акцента</span><input type="color" style={S.clr} value={accent} onChange={e=>setAccent(e.target.value)}/>
                <button style={{...S.aBt,marginTop:14}} onClick={saveAll} disabled={saving}>{saving?'Сохранение...':'💾 Сохранить всё'}</button>
              </div>}
            </>
          )}
        </div>
      </div>
    )}

    {addOpen&&(
      <div style={{...S.adO,zIndex:400}}>
        <div style={{...S.adP,maxHeight:'88vh'}}>
          <button style={S.adC} onClick={()=>setAddOpen(false)}>✕</button>
          <div style={{padding:'13px 14px',borderBottom:`1px solid ${v.b2}`}}><div style={{fontWeight:700,fontSize:15}}>{ep.id?'Редактировать':'Добавить товар'}</div></div>
          <div style={{padding:14,overflowY:'auto'}}>
            {ep.photo&&<div style={{width:'100%',height:100,background:v.b2,borderRadius:9,marginBottom:11,overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center',border:`1px solid ${v.b1}`}}>
              <img src={ep.photo} alt="" style={{maxWidth:'100%',maxHeight:'100%',objectFit:'contain'}} onError={e=>e.target.style.display='none'}/>
            </div>}
            {[{l:'Название *',k:'name',p:'DUFT 5%'},{l:'Бренд',k:'brand',p:'DUFT'},{l:'Категория',k:'cat',p:'Жидкости Premium'},{l:'Цена (₽) *',k:'price',p:'250',t:'number'},{l:'Единица',k:'unit',p:'шт'},{l:'Артикул',k:'sku',p:'929649'},{l:'Иконка',k:'emoji',p:'🧴'},{l:'Ссылка на фото',k:'photo',p:'https://example.com/img.jpg'}].map(f=>(
              <div key={f.k} style={{marginBottom:9}}><span style={S.aFL}>{f.l}</span><input style={S.aIn} type={f.t||'text'} placeholder={f.p} value={ep[f.k]} onChange={e=>setEp(p=>({...p,[f.k]:e.target.value}))}/></div>
            ))}
            <button style={{...S.aBt,marginTop:7}} onClick={saveP}>💾 Сохранить</button>
          </div>
        </div>
      </div>
    )}
  </div>)
}

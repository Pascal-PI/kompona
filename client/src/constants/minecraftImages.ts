import technobladeImage from '@assets/minecraft_theme/technoblade.png';
import dreamImage from '@assets/minecraft_theme/dream.png';
import georgeImage from '@assets/minecraft_theme/georgenotfound.png';
import sapnapImage from '@assets/minecraft_theme/sapnap.png';
import badboyhaloImage from '@assets/minecraft_theme/badboyhalo.png';
import tommyImage from '@assets/minecraft_theme/tommyinnit.png';
import tubboImage from '@assets/minecraft_theme/tubbo.png';
import ranbooImage from '@assets/minecraft_theme/ranboo.png';
import wilburImage from '@assets/minecraft_theme/wilbursoot.png';
import quackityImage from '@assets/minecraft_theme/quackity.png';
import philzaImage from '@assets/minecraft_theme/philza.png';
import karlImage from '@assets/minecraft_theme/karljacobs.png';
import jackImage from '@assets/minecraft_theme/jackmanifold.png';
import puffyImage from '@assets/minecraft_theme/captainpuffy.png';
import foolishImage from '@assets/minecraft_theme/foolish-gamers.png';
import punzImage from '@assets/minecraft_theme/punz.png';
import fundyImage from '@assets/minecraft_theme/fundy.png';
import antfrostImage from '@assets/minecraft_theme/antfrost.png';
import samImage from '@assets/minecraft_theme/awesamdude.png';
import nikiImage from '@assets/minecraft_theme/niki-nihachu.png';
import tinaImage from '@assets/minecraft_theme/tinakitten.png';
import eretImage from '@assets/minecraft_theme/eret.png';
import skeppyImage from '@assets/minecraft_theme/skeppy.png';
import a6dImage from '@assets/minecraft_theme/a6d.png';
import connorImage from '@assets/minecraft_theme/connoreatspants.png';
import prestonImage from '@assets/minecraft_theme/prestonplayz.png';
import ssundeeImage from '@assets/minecraft_theme/ssundee.png';
import dantdmImage from '@assets/minecraft_theme/dantdm.png';
import stampyImage from '@assets/minecraft_theme/stampylongnose.png';
import sparklezImage from '@assets/minecraft_theme/captainsparklez.png';
import notchImage from '@assets/minecraft_theme/notch.png';
import jebImage from '@assets/minecraft_theme/jeb.png';

const symbolToMinecraft: Array<[string, string, string]> = [
  ['saint-francis',     technobladeImage, 'Technoblade'],
  ['saint-mary',        dreamImage,       'Dream'],
  ['saint-joseph',      georgeImage,      'GeorgeNotFound'],
  ['saint-anthony',     sapnapImage,      'Sapnap'],
  ['saint-teresa',      badboyhaloImage,  'BadBoyHalo'],
  ['saint-michael',     tommyImage,       'TommyInnit'],
  ['saint-peter',       tubboImage,       'Tubbo'],
  ['saint-john',        ranbooImage,      'Ranboo'],
  ['saint-paul',        wilburImage,      'Wilbur Soot'],
  ['saint-luke',        quackityImage,    'Quackity'],
  ['saint-mark',        philzaImage,      'Philza'],
  ['saint-matthew',     karlImage,        'Karl Jacobs'],
  ['saint-gabriel',     jackImage,        'JackManifoldTV'],
  ['saint-raphael',     puffyImage,       'CaptainPuffy'],
  ['saint-thomas',      foolishImage,     'Foolish Gamers'],
  ['saint-james',       punzImage,        'Punz'],
  ['saint-andrew',      fundyImage,       'Fundy'],
  ['saint-bartholomew', antfrostImage,    'Antfrost'],
  ['saint-philip',      samImage,         'Awesamdude'],
  ['saint-simon',       nikiImage,        'Niki Nihachu'],
  ['saint-jude',        tinaImage,        'tinakitten'],
  ['saint-matthias',    eretImage,        'Eret'],
  ['saint-stephen',     skeppyImage,      'Skeppy'],
  ['saint-lawrence',    a6dImage,         'a6d'],
  ['saint-sebastian',   connorImage,      'ConnorEatsPants'],
  ['saint-christopher', prestonImage,     'PrestonPlayz'],
  ['saint-patrick',     ssundeeImage,     'SSundee'],
  ['saint-george',      dantdmImage,      'DanTDM'],
  ['saint-nicholas',    stampyImage,      'Stampy'],
  ['saint-valentine',   sparklezImage,    'CaptainSparklez'],
  ['saint-martin',      notchImage,       'Notch'],
  ['saint-augustine',   jebImage,         'jeb_'],
];

export const minecraftImages: { [key: string]: string } = Object.fromEntries(
  symbolToMinecraft.map(([sym, img]) => [sym, img]),
);

const minecraftNames: { [key: string]: string } = Object.fromEntries(
  symbolToMinecraft.map(([sym, , name]) => [sym, name]),
);

export function getMinecraftDisplayName(symbol: string): string {
  if (minecraftNames[symbol]) return minecraftNames[symbol];
  const stripped = symbol.replace(/^saint-/, '');
  return stripped
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const minecraftFacts: { [key: string]: { name: string; fact: string } } = {
  'saint-francis':     { name: 'Technoblade', fact: 'Legendary Minecraft Monday and Hypixel champion known for his pig-king skin. Technoblade never dies.' },
  'saint-mary':        { name: 'Dream',       fact: 'Co-founder of the Dream SMP. Famous for speedruns, manhunts, and the smiley-face mask.' },
  'saint-joseph':      { name: 'GeorgeNotFound', fact: 'Co-host of Dream\'s manhunts and a long-time member of the Dream Team.' },
  'saint-anthony':     { name: 'Sapnap',      fact: 'Third member of the Dream Team, known for his fiery red bandana and PvP skills.' },
  'saint-teresa':      { name: 'BadBoyHalo',  fact: 'Founder of the MunchyMC server and one of the original Dream SMP members. Catchphrase: "you muffinhead!"' },
  'saint-michael':     { name: 'TommyInnit',  fact: 'British streamer who became one of the youngest creators to hit massive Twitch milestones during the Dream SMP era.' },
  'saint-peter':       { name: 'Tubbo',       fact: 'Best known as President Tubbo of L\'Manburg on the Dream SMP and for his bee obsession.' },
  'saint-john':        { name: 'Ranboo',      fact: 'Half-enderman streamer known for the iconic black-and-white split-face skin.' },
  'saint-paul':        { name: 'Wilbur Soot', fact: 'Lore-builder of the Dream SMP and founder of L\'Manburg. Also a musician.' },
  'saint-luke':        { name: 'Quackity',    fact: 'Founder of the QSMP, multilingual streamer and creator of Las Nevadas on the Dream SMP.' },
  'saint-mark':        { name: 'Philza',      fact: 'Veteran hardcore-mode survivor who lost a famous 5-year world. Adoptive dad of much of the SMP roster.' },
  'saint-matthew':     { name: 'Karl Jacobs', fact: 'Time-traveling lore character of the Dream SMP and creator of Tales from the SMP.' },
  'saint-gabriel':     { name: 'JackManifoldTV', fact: 'Indestructible Dream SMP member famous for being chronically un-killable.' },
  'saint-raphael':     { name: 'CaptainPuffy', fact: 'Dream SMP therapist and friend to all. Known for the pink sheep-themed skin.' },
  'saint-thomas':      { name: 'Foolish Gamers', fact: 'Builder extraordinaire whose totem-shark skin and massive structures defined the late Dream SMP.' },
  'saint-james':       { name: 'Punz',        fact: 'PvP specialist on the Dream SMP, often hired as a mercenary in the lore.' },
  'saint-andrew':      { name: 'Fundy',       fact: 'Furry fox streamer, son of Wilbur Soot in the lore, and a Minecraft mod developer.' },
  'saint-bartholomew': { name: 'Antfrost',    fact: 'Cat-themed streamer and Dream SMP member with a love for ocelots.' },
  'saint-philip':      { name: 'Awesamdude',  fact: 'Architect of the Dream SMP\'s prison, Pandora\'s Vault, and warden of Dream himself.' },
  'saint-simon':       { name: 'Niki Nihachu', fact: 'Cottagecore queen of the SMP. Founded L\'Manberg\'s lake and Snowchester garden.' },
  'saint-jude':        { name: 'tinakitten',  fact: 'QSMP streamer with a cat-themed skin known for emotional storytelling.' },
  'saint-matthias':    { name: 'Eret',        fact: 'King of the Dream SMP after the Disc War, famous for the rainbow sunglasses skin.' },
  'saint-stephen':     { name: 'Skeppy',      fact: 'Diamond-obsessed prankster, BadBoyHalo\'s best friend, and host of Skeppy\'s Twitch chaos.' },
  'saint-lawrence':    { name: 'a6d',         fact: 'French streamer and longtime friend of the BBH/Skeppy crew.' },
  'saint-sebastian':   { name: 'ConnorEatsPants', fact: 'Dream SMP comedian and founder of "Pog 2020".' },
  'saint-christopher': { name: 'PrestonPlayz', fact: 'YouTube veteran behind Cosmic PvP and one of the longest-running Minecraft channels.' },
  'saint-patrick':     { name: 'SSundee',     fact: 'YouTube legend known for modded Minecraft, Among Us, and the iconic SSundee skin.' },
  'saint-george':      { name: 'DanTDM',      fact: 'The Diamond Minecart — one of the all-time most-watched Minecraft creators on YouTube.' },
  'saint-nicholas':    { name: 'Stampy',      fact: 'Stampy Cat\'s "Lovely World" introduced an entire generation of kids to Minecraft.' },
  'saint-valentine':   { name: 'CaptainSparklez', fact: 'Creator of "Revenge" and "TNT" — the Minecraft music videos that defined an era.' },
  'saint-martin':      { name: 'Notch',       fact: 'Markus Persson, the original creator of Minecraft, who sold Mojang to Microsoft in 2014.' },
  'saint-augustine':   { name: 'jeb_',        fact: 'Jens Bergensten, lead designer of Minecraft after Notch, behind countless updates and the "Jeb sheep".' },
};

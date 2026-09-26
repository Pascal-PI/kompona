import { GameCard as GameCardType } from '../../types/game';
import { cn } from '../../lib/utils';
import { animalImages, getAnimalDisplayName } from '../../constants/animalImages';
import { barbieImages, getBarbieDisplayName } from '../../constants/barbieImages';
import { puppyImages, getPuppyDisplayName } from '../../constants/puppyImages';
import { santaImages, getSantaDisplayName } from '../../constants/santaImages';
import { spaceImages, getSpaceDisplayName } from '../../constants/spaceImages';
import { minecraftImages, getMinecraftDisplayName } from '../../constants/minecraftImages';

// Import saint images - original assets
import saintFrancisImage from '../../assets/saints/Saint_Francis_portrait_d9d9f58d.png';
import saintMaryImage from '../../assets/saints/Virgin_Mary_portrait_7a48e575.png';
import saintJosephImage from '../../assets/saints/Saint_Joseph_portrait_e8555a2a.png';
import saintAnthonyImage from '../../assets/saints/Saint_Anthony_portrait_2496c52c.png';
import saintTeresaImage from '../../assets/saints/Saint_Teresa_portrait_4b18de85.png';
import saintMichaelImage from '../../assets/saints/Saint_Michael_portrait_3ea0c30d.png';
import saintPeterImage from '../../assets/saints/Saint_Peter_portrait_50337294.png';
import saintJohnImage from '../../assets/saints/Saint_John_portrait_3ce91636.png';

// Import new generated saint images
import saintPaulImage from '../../assets/saints/Saint_Paul_portrait_5302fbfb.png';
import saintLukeImage from '../../assets/saints/Saint_Luke_portrait_5f85b137.png';
import saintMarkImage from '../../assets/saints/Saint_Mark_portrait_7c8c6430.png';
import saintMatthewImage from '../../assets/saints/Saint_Matthew_portrait_6f35be64.png';
import saintGabrielImage from '../../assets/saints/Archangel_Gabriel_portrait_86e4bd6b.png';
import saintRaphaelImage from '../../assets/saints/Archangel_Raphael_portrait_2ed37d00.png';
import saintThomasImage from '../../assets/saints/Saint_Thomas_portrait_5dbe187a.png';
import saintJamesImage from '../../assets/saints/Saint_James_portrait_4135fb13.png';
import saintAndrewImage from '../../assets/saints/Saint_Andrew_portrait_4b9fef08.png';
import saintChristopherImage from '../../assets/saints/Saint_Christopher_portrait_58e51194.png';
import saintPatrickImage from '../../assets/saints/Saint_Patrick_portrait_910b2cee.png';
import saintGeorgeImage from '../../assets/saints/Saint_George_portrait_e8064f78.png';
import saintCatherineImage from '../../assets/saints/Saint_Catherine_portrait_8a2409ff.png';
import saintAgnesImage from '../../assets/saints/Saint_Agnes_portrait_bb1ab019.png';
import saintSebastianImage from '../../assets/saints/Saint_Sebastian_portrait_79cde015.png';
import saintNicholasImage from '../../assets/saints/Saint_Nicholas_portrait_2bbb30d0.png';

// Import additional saints - batch 2
import saintJoanImage from '../../assets/saints/Saint_Joan_portrait_8bc1e32c.png';
import saintBenedictImage from '../../assets/saints/Saint_Benedict_portrait_33c735a5.png';
import saintClareImage from '../../assets/saints/Saint_Clare_portrait_86011ec2.png';
import saintDominicImage from '../../assets/saints/Saint_Dominic_portrait_824fb091.png';
import saintIgnatiusImage from '../../assets/saints/Saint_Ignatius_portrait_fcb30756.png';
import saintRitaImage from '../../assets/saints/Saint_Rita_portrait_3acb1e3c.png';
import saintBartholomewImage from '../../assets/saints/Saint_Bartholomew_portrait_6982f209.png';
import saintPhilipImage from '../../assets/saints/Saint_Philip_portrait_7028c42c.png';
import saintThaddeusImage from '../../assets/saints/Saint_Thaddeus_portrait_85110b60.png';
import saintSimonImage from '../../assets/saints/Saint_Simon_portrait_37438cdf.png';
import saintMatthiasImage from '../../assets/saints/Saint_Matthias_portrait_78f99e2e.png';
import saintCeciliaImage from '../../assets/saints/Saint_Cecilia_portrait_a2520975.png';

// Import additional saints - batch 3
import saintAugustineImage from '../../assets/saints/Saint_Augustine_portrait_218a351c.png';
import saintLawrenceImage from '../../assets/saints/Saint_Lawrence_portrait_66afe9be.png';
import saintStephenImage from '../../assets/saints/Saint_Stephen_portrait_bbdd7110.png';
import saintMartinImage from '../../assets/saints/Saint_Martin_portrait_8fe0e1c2.png';
import saintBlaiseImage from '../../assets/saints/Saint_Blaise_portrait_16963176.png';
import saintLucyImage from '../../assets/saints/Saint_Lucy_portrait_d0f2027c.png';
import saintBarbaraImage from '../../assets/saints/Saint_Barbara_portrait_c3938129.png';
import saintApolloniaImage from '../../assets/saints/Saint_Apollonia_portrait_fc6c012e.png';
import saintValentineImage from '../../assets/saints/Saint_Valentine_portrait_37dcffb8.png';
import saintAmbroseImage from '../../assets/saints/Saint_Ambrose_portrait_e972c949.png';
import saintJeromeImage from '../../assets/saints/Saint_Jerome_portrait_f8c8d644.png';
import saintGregoryImage from '../../assets/saints/Saint_Gregory_portrait_0b900734.png';

const saintImages: { [key: string]: string } = {
  // Original assets
  'saint-francis': saintFrancisImage,
  'saint-mary': saintMaryImage,
  'saint-joseph': saintJosephImage,
  'saint-anthony': saintAnthonyImage,
  'saint-teresa': saintTeresaImage,
  'saint-michael': saintMichaelImage,
  'saint-peter': saintPeterImage,
  'saint-john': saintJohnImage,
  
  // New generated images
  'saint-paul': saintPaulImage,
  'saint-luke': saintLukeImage,
  'saint-mark': saintMarkImage,
  'saint-matthew': saintMatthewImage,
  'saint-gabriel': saintGabrielImage,
  'saint-raphael': saintRaphaelImage,
  'saint-thomas': saintThomasImage,
  'saint-james': saintJamesImage,
  'saint-andrew': saintAndrewImage,
  'saint-christopher': saintChristopherImage,
  'saint-patrick': saintPatrickImage,
  'saint-george': saintGeorgeImage,
  'saint-catherine': saintCatherineImage,
  'saint-agnes': saintAgnesImage,
  'saint-sebastian': saintSebastianImage,
  'saint-nicholas': saintNicholasImage,
  
  // Additional saints - batch 2
  'saint-joan': saintJoanImage,
  'saint-benedict': saintBenedictImage,
  'saint-clare': saintClareImage,
  'saint-dominic': saintDominicImage,
  'saint-ignatius': saintIgnatiusImage,
  'saint-rita': saintRitaImage,
  'saint-bartholomew': saintBartholomewImage,
  'saint-philip': saintPhilipImage,
  'saint-thaddeus': saintThaddeusImage,
  'saint-simon': saintSimonImage,
  'saint-matthias': saintMatthiasImage,
  'saint-cecilia': saintCeciliaImage,
  
  // Additional saints - batch 3
  'saint-augustine': saintAugustineImage,
  'saint-lawrence': saintLawrenceImage,
  'saint-stephen': saintStephenImage,
  'saint-martin': saintMartinImage,
  'saint-blaise': saintBlaiseImage,
  'saint-lucy': saintLucyImage,
  'saint-barbara': saintBarbaraImage,
  'saint-apollonia': saintApolloniaImage,
  'saint-valentine': saintValentineImage,
  'saint-ambrose': saintAmbroseImage,
  'saint-jerome': saintJeromeImage,
  'saint-gregory': saintGregoryImage,
};

// Helper function to get saint display name
const getSaintDisplayName = (saintKey: string): string => {
  return saintKey
    .replace('saint-', '')
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface GameCardProps {
  card: GameCardType;
  index: number;
  onFlip: (index: number) => void;
  onCardInfo?: (symbol: string, theme: "saints" | "animals" | "barbie" | "puppy" | "santa" | "space" | "minecraft") => void;
  disabled?: boolean;
  theme?: "saints" | "animals" | "barbie" | "puppy" | "santa" | "space" | "minecraft";
}

export function GameCard({ card, index, onFlip, onCardInfo, disabled, theme = "saints" }: GameCardProps) {
  const handleClick = () => {
    // If card is flipped or matched, show info
    if ((card.isFlipped || card.isMatched) && onCardInfo) {
      onCardInfo(card.symbol, theme);
    } else if (!disabled && !card.isFlipped && !card.isMatched) {
      // Flip the card AND show its info immediately
      onFlip(index);
      if (onCardInfo) {
        onCardInfo(card.symbol, theme);
      }
    }
  };

  // Select appropriate image set based on theme
  let imageSet: { [key: string]: string };
  let displayNameFn: (key: string) => string;
  
  if (theme === "animals") {
    imageSet = animalImages;
    displayNameFn = getAnimalDisplayName;
  } else if (theme === "barbie") {
    imageSet = barbieImages;
    displayNameFn = getBarbieDisplayName;
  } else if (theme === "puppy") {
    imageSet = puppyImages;
    displayNameFn = getPuppyDisplayName;
  } else if (theme === "santa") {
    imageSet = santaImages;
    displayNameFn = getSantaDisplayName;
  } else if (theme === "space") {
    imageSet = spaceImages;
    displayNameFn = getSpaceDisplayName;
  } else if (theme === "minecraft") {
    imageSet = minecraftImages;
    displayNameFn = getMinecraftDisplayName;
  } else {
    imageSet = saintImages;
    displayNameFn = getSaintDisplayName;
  }

  return (
    <button
      type="button"
      aria-label={`${card.isFlipped || card.isMatched ? displayNameFn(card.symbol) : "Hidden card"} at position ${index + 1}`}
      className="card-3d aspect-square w-full cursor-pointer border-0 bg-transparent p-0"
      onClick={handleClick}
      disabled={Boolean(disabled && !card.isFlipped && !card.isMatched)}
    >
      <div className={cn("card-inner relative w-full h-full", {
        "card-flipped": card.isFlipped || card.isMatched
      })}>
        {/* Front of card */}
        <div className="card-front absolute inset-0 flex items-center justify-center overflow-hidden rounded-[14px] border-2 border-[#e5b84c]/70 bg-[#192434] shadow-[0_7px_0_#101822] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_11px_0_#101822]">
          <div className="text-center">
            <div className="mx-auto mb-2 h-8 w-8 rotate-45 rounded-md border-2 border-[#e5b84c]/80" aria-hidden="true" />
            <div className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#fff8ec]/70">Kompana</div>
          </div>
        </div>
        
        {/* Back of card */}
        <div className={cn(
             "card-back absolute inset-0 flex items-center justify-center overflow-hidden rounded-[14px] border-2 border-[#fffaf1] shadow-[0_7px_0_#101822]",
          card.isMatched 
            ? "bg-chess-success border-chess-success/50" 
            : "bg-chess-primary border-chess-primary/50"
        )}>
          {imageSet[card.symbol] ? (
            <img 
              src={imageSet[card.symbol]} 
              alt={displayNameFn(card.symbol)} 
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
             <div className="p-2 text-center">
              <div className="text-xs text-white font-semibold leading-tight">
                {displayNameFn(card.symbol)}
              </div>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

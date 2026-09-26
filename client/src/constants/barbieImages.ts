// Barbie images with explicit mappings to saint symbols
import architectImage from '../assets/barbies/Architect_Barbie_portrait_d0b9bc43.png';
import artistImage from '../assets/barbies/Artist_Barbie_portrait_f947a900.png';
import astronautImage from '../assets/barbies/Astronaut_Barbie_portrait_f8ae0246.png';
import bakerImage from '../assets/barbies/Baker_Barbie_portrait_782a5b43.png';
import ballerinaImage from '../assets/barbies/Ballerina_Barbie_portrait_bd8d5c75.png';
import baristaImage from '../assets/barbies/Barista_Barbie_portrait_17ebf213.png';
import brideImage from '../assets/barbies/Bride_Barbie_portrait_48938414.png';
import businessImage from '../assets/barbies/Business_Barbie_portrait_b2fff1e3.png';
import chefImage from '../assets/barbies/Chef_Barbie_portrait_baa8d798.png';
import classicImage from '../assets/barbies/Classic_Barbie_portrait_52b76244.png';
import cowgirlImage from '../assets/barbies/Cowgirl_Barbie_portrait_cacf148a.png';
import dentistImage from '../assets/barbies/Dentist_Barbie_portrait_72405d76.png';
import detectiveImage from '../assets/barbies/Detective_Barbie_portrait_24b35dd4.png';
import djImage from '../assets/barbies/DJ_Barbie_portrait_3a2241ac.png';
import doctorImage from '../assets/barbies/Doctor_Barbie_portrait_065907eb.png';
import engineerImage from '../assets/barbies/Engineer_Barbie_portrait_964a1ba0.png';
import environmentalImage from '../assets/barbies/Environmental_Barbie_portrait_f949a361.png';
import equestrianImage from '../assets/barbies/Equestrian_Barbie_portrait_10b827e0.png';
import fairyImage from '../assets/barbies/Fairy_Barbie_portrait_dd065c41.png';
import fashionDesignerImage from '../assets/barbies/Fashion_Designer_Barbie_portrait_5c072146.png';
import figureSkaterImage from '../assets/barbies/Figure_Skater_Barbie_portrait_26706b33.png';
import firefighterImage from '../assets/barbies/Firefighter_Barbie_portrait_eb77b1ea.png';
import flightAttendantImage from '../assets/barbies/Flight_Attendant_Barbie_portrait_301a85ad.png';
import floristImage from '../assets/barbies/Florist_Barbie_portrait_92262745.png';
import gameDeveloperImage from '../assets/barbies/Game_Developer_Barbie_portrait_b6b81986.png';
import gardenerImage from '../assets/barbies/Gardener_Barbie_portrait_adbdf2d8.png';
import gymnastImage from '../assets/barbies/Gymnast_Barbie_portrait_13420799.png';
import hairStylistImage from '../assets/barbies/Hair_Stylist_Barbie_portrait_834c6e18.png';
import holidayImage from '../assets/barbies/Holiday_Barbie_portrait_555fb3a7.png';
import journalistImage from '../assets/barbies/Journalist_Barbie_portrait_2b73b4bb.png';
import librarianImage from '../assets/barbies/Librarian_Barbie_portrait_5baa66f0.png';
import magicianImage from '../assets/barbies/Magician_Barbie_portrait_38d44171.png';
import makeupArtistImage from '../assets/barbies/Makeup_Artist_Barbie_portrait_4f7ae192.png';
import marineBiologistImage from '../assets/barbies/Marine_Biologist_Barbie_portrait_58361fe8.png';
import mermaidImage from '../assets/barbies/Mermaid_Barbie_portrait_9e9c2547.png';
import mountaineerImage from '../assets/barbies/Mountaineer_Barbie_portrait_a0d47729.png';
import movieStarImage from '../assets/barbies/Movie_Star_Barbie_portrait_67981c05.png';
import newsAnchorImage from '../assets/barbies/News_Anchor_Barbie_portrait_e4adb26e.png';
import nurseImage from '../assets/barbies/Nurse_Barbie_portrait_428d4272.png';
import paleontologistImage from '../assets/barbies/Paleontologist_Barbie_portrait_19b60443.png';
import partyImage from '../assets/barbies/Party_Barbie_portrait_299973ee.png';
import photographerImage from '../assets/barbies/Photographer_Barbie_portrait_cc470f91.png';
import pilotImage from '../assets/barbies/Pilot_Barbie_portrait_8876a682.png';
import pirateImage from '../assets/barbies/Pirate_Barbie_portrait_9bc9af6d.png';
import policeImage from '../assets/barbies/Police_Barbie_portrait_ffb44f5a.png';
import popStarImage from '../assets/barbies/Pop_Star_Barbie_portrait_59108b94.png';
import princessImage from '../assets/barbies/Princess_Barbie_portrait_6c953dba.png';
import programmerImage from '../assets/barbies/Programmer_Barbie_portrait_a6f3b8e8.png';
import raceCarImage from '../assets/barbies/Race_Car_Barbie_portrait_3b86338b.png';
import roboticsImage from '../assets/barbies/Robotics_Barbie_portrait_574a96b2.png';
import rockStarImage from '../assets/barbies/Rock_Star_Barbie_portrait_d774d632.png';
import scientistImage from '../assets/barbies/Scientist_Barbie_portrait_d741d48b.png';
import skierImage from '../assets/barbies/Skier_Barbie_portrait_540dd2b7.png';
import snowboarderImage from '../assets/barbies/Snowboarder_Barbie_portrait_32dbb5d3.png';
import soccerImage from '../assets/barbies/Soccer_Barbie_portrait_a24d909a.png';
import superheroImage from '../assets/barbies/Superhero_Barbie_portrait_164d42ff.png';
import surferImage from '../assets/barbies/Surfer_Barbie_portrait_bdbd9b97.png';
import swimmerImage from '../assets/barbies/Swimmer_Barbie_portrait_da03b72c.png';
import teacherImage from '../assets/barbies/Teacher_Barbie_portrait_69e2830e.png';
import tennisImage from '../assets/barbies/Tennis_Barbie_portrait_38803845.png';
import unicornImage from '../assets/barbies/Unicorn_Barbie_portrait_b20215a8.png';
import veterinarianImage from '../assets/barbies/Veterinarian_Barbie_portrait_40c7b39c.png';
import yogaImage from '../assets/barbies/Yoga_Barbie_portrait_777d3939.png';
import zookeeperImage from '../assets/barbies/Zookeeper_Barbie_portrait_4fa8bfe9.png';

// Explicit mapping of saint symbols to Barbie images
export const barbieImages: { [key: string]: string } = {
  // Matching CARD_SYMBOLS order from use-pexeso-game.ts
  'saint-francis': architectImage,
  'saint-mary': artistImage,
  'saint-joseph': astronautImage,
  'saint-anthony': bakerImage,
  'saint-teresa': ballerinaImage,
  'saint-michael': baristaImage,
  'saint-peter': brideImage,
  'saint-john': businessImage,
  'saint-paul': chefImage,
  'saint-luke': classicImage,
  'saint-mark': cowgirlImage,
  'saint-matthew': dentistImage,
  'saint-gabriel': detectiveImage,
  'saint-raphael': djImage,
  'saint-thomas': doctorImage,
  'saint-james': engineerImage,
  'saint-andrew': environmentalImage,
  'saint-bartholomew': equestrianImage,
  'saint-philip': fairyImage,
  'saint-simon': fashionDesignerImage,
  'saint-jude': figureSkaterImage,
  'saint-matthias': firefighterImage,
  'saint-stephen': flightAttendantImage,
  'saint-lawrence': floristImage,
  'saint-sebastian': gameDeveloperImage,
  'saint-christopher': gardenerImage,
  'saint-patrick': gymnastImage,
  'saint-george': hairStylistImage,
  'saint-nicholas': holidayImage,
  'saint-valentine': journalistImage,
  'saint-martin': librarianImage,
  'saint-augustine': magicianImage,
  'saint-jerome': makeupArtistImage,
  'saint-bernard': marineBiologistImage,
  'saint-dominic': mermaidImage,
  'saint-aquinas': mountaineerImage,
  'saint-catherine': movieStarImage,
  'saint-agnes': newsAnchorImage,
  'saint-clare': nurseImage,
  'saint-cecilia': paleontologistImage,
  'saint-lucy': partyImage,
  'saint-barbara': photographerImage,
  'saint-margaret': pilotImage,
  'saint-rita': pirateImage,
  'saint-bernadette': policeImage,
  'saint-joan': popStarImage,
  'saint-therese': princessImage,
  'saint-monica': programmerImage,
  'saint-helena': raceCarImage,
  'saint-elizabeth': roboticsImage,
  'saint-anne': rockStarImage,
  'saint-martha': scientistImage,
  'saint-magdalene': skierImage,
  'saint-veronica': snowboarderImage,
  'saint-anastasia': soccerImage,
  'saint-agatha': superheroImage,
  'saint-polycarp': surferImage,
  'saint-ignatius': swimmerImage,
  'saint-justin': teacherImage,
  'saint-cyprian': tennisImage,
  'saint-ambrose': unicornImage,
  'saint-chrysostom': veterinarianImage,
  'saint-basil': yogaImage,
  'saint-gregory': zookeeperImage,
};

// Helper function to get Barbie display name from saint symbol
export function getBarbieDisplayName(symbol: string): string {
  const barbieNames: { [key: string]: string } = {
    'saint-francis': 'Architect',
    'saint-mary': 'Artist',
    'saint-joseph': 'Astronaut',
    'saint-anthony': 'Baker',
    'saint-teresa': 'Ballerina',
    'saint-michael': 'Barista',
    'saint-peter': 'Bride',
    'saint-john': 'Business Executive',
    'saint-paul': 'Chef',
    'saint-luke': 'Classic',
    'saint-mark': 'Cowgirl',
    'saint-matthew': 'Dentist',
    'saint-gabriel': 'Detective',
    'saint-raphael': 'DJ',
    'saint-thomas': 'Doctor',
    'saint-james': 'Engineer',
    'saint-andrew': 'Environmental Scientist',
    'saint-bartholomew': 'Equestrian',
    'saint-philip': 'Fairy',
    'saint-simon': 'Fashion Designer',
    'saint-jude': 'Figure Skater',
    'saint-matthias': 'Firefighter',
    'saint-stephen': 'Flight Attendant',
    'saint-lawrence': 'Florist',
    'saint-sebastian': 'Game Developer',
    'saint-christopher': 'Gardener',
    'saint-patrick': 'Gymnast',
    'saint-george': 'Hair Stylist',
    'saint-nicholas': 'Holiday',
    'saint-valentine': 'Journalist',
    'saint-martin': 'Librarian',
    'saint-augustine': 'Magician',
    'saint-jerome': 'Makeup Artist',
    'saint-bernard': 'Marine Biologist',
    'saint-dominic': 'Mermaid',
    'saint-aquinas': 'Mountaineer',
    'saint-catherine': 'Movie Star',
    'saint-agnes': 'News Anchor',
    'saint-clare': 'Nurse',
    'saint-cecilia': 'Paleontologist',
    'saint-lucy': 'Party',
    'saint-barbara': 'Photographer',
    'saint-margaret': 'Pilot',
    'saint-rita': 'Pirate',
    'saint-bernadette': 'Police Officer',
    'saint-joan': 'Pop Star',
    'saint-therese': 'Princess',
    'saint-monica': 'Programmer',
    'saint-helena': 'Race Car Driver',
    'saint-elizabeth': 'Robotics Engineer',
    'saint-anne': 'Rock Star',
    'saint-martha': 'Scientist',
    'saint-magdalene': 'Skier',
    'saint-veronica': 'Snowboarder',
    'saint-anastasia': 'Soccer Player',
    'saint-agatha': 'Superhero',
    'saint-polycarp': 'Surfer',
    'saint-ignatius': 'Swimmer',
    'saint-justin': 'Teacher',
    'saint-cyprian': 'Tennis Player',
    'saint-ambrose': 'Unicorn',
    'saint-chrysostom': 'Veterinarian',
    'saint-basil': 'Yoga Instructor',
    'saint-gregory': 'Zookeeper',
  };

  return barbieNames[symbol] || 'Barbie';
}

// Export symbol list for reference
export const barbieSymbols = Object.keys(barbieImages);

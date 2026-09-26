// Puppy images with explicit mappings to saint symbols
// Using AI-generated puppy images
import goldenRetrieverImage from '@assets/generated_images/golden_retriever_puppy.png';
import blackLabImage from '@assets/generated_images/black_lab_puppy.png';
import corgiImage from '@assets/generated_images/corgi_puppy.png';
import huskyImage from '@assets/generated_images/husky_puppy.png';
import bulldogImage from '@assets/generated_images/bulldog_puppy.png';
import dachshundImage from '@assets/generated_images/dachshund_puppy.png';
import poodleImage from '@assets/generated_images/poodle_puppy.png';
import beagleImage from '@assets/generated_images/beagle_puppy.png';
import germanShepherdImage from '@assets/generated_images/german_shepherd_puppy.png';
import shibaInuImage from '@assets/generated_images/shiba_inu_puppy.png';
import labradoodleImage from '@assets/generated_images/labradoodle_puppy.png';
import cavalierImage from '@assets/generated_images/cavalier_puppy.png';
import boxerImage from '@assets/generated_images/boxer_puppy.png';
import malteseImage from '@assets/generated_images/maltese_puppy.png';
import pugImage from '@assets/generated_images/pug_puppy.png';
import berneseseImage from '@assets/generated_images/bernese_puppy.png';
import collieImage from '@assets/generated_images/collie_puppy.png';
import pomeranianImage from '@assets/generated_images/pomeranian_puppy.png';
import papillonImage from '@assets/generated_images/papillon_puppy.png';
import dalmatianImage from '@assets/generated_images/dalmatian_puppy.png';
import pemberrokeCorgiImage from '@assets/generated_images/pembroke_corgi_puppy.png';
import goldendoodleImage from '@assets/generated_images/goldendoodle_puppy.png';
import schnauzersImage from '@assets/generated_images/schnauzer_puppy.png';
import sheltieImage from '@assets/generated_images/sheltie_puppy.png';
import bostonTerrierImage from '@assets/generated_images/boston_terrier_puppy.png';
import minPinImage from '@assets/generated_images/min_pin_puppy.png';
import sibHuskyImage from '@assets/generated_images/siberian_husky_puppy.png';
import pugMixImage from '@assets/generated_images/pug_mix_puppy.png';
import cairnTerrierImage from '@assets/generated_images/cairn_terrier_puppy.png';
import cockerSpanielImage from '@assets/generated_images/cocker_spaniel_puppy.png';

// Explicit mapping of saint symbols to Puppy images
export const puppyImages: { [key: string]: string } = {
  'saint-francis': goldenRetrieverImage,
  'saint-mary': blackLabImage,
  'saint-joseph': corgiImage,
  'saint-anthony': huskyImage,
  'saint-teresa': bulldogImage,
  'saint-michael': dachshundImage,
  'saint-peter': poodleImage,
  'saint-john': beagleImage,
  'saint-paul': germanShepherdImage,
  'saint-luke': shibaInuImage,
  'saint-mark': labradoodleImage,
  'saint-matthew': cavalierImage,
  'saint-gabriel': boxerImage,
  'saint-raphael': malteseImage,
  'saint-thomas': pugImage,
  'saint-james': berneseseImage,
  'saint-andrew': collieImage,
  'saint-bartholomew': pomeranianImage,
  'saint-philip': papillonImage,
  'saint-simon': dalmatianImage,
  'saint-jude': pemberrokeCorgiImage,
  'saint-matthias': goldendoodleImage,
  'saint-stephen': schnauzersImage,
  'saint-lawrence': sheltieImage,
  'saint-sebastian': bostonTerrierImage,
  'saint-christopher': minPinImage,
  'saint-patrick': sibHuskyImage,
  'saint-george': pugMixImage,
  'saint-nicholas': cairnTerrierImage,
  'saint-valentine': cockerSpanielImage,
  'saint-martin': goldenRetrieverImage,
  'saint-augustine': blackLabImage,
  'saint-jerome': corgiImage,
  'saint-bernard': huskyImage,
  'saint-dominic': bulldogImage,
  'saint-aquinas': dachshundImage,
  'saint-catherine': poodleImage,
  'saint-agnes': beagleImage,
  'saint-clare': germanShepherdImage,
  'saint-cecilia': shibaInuImage,
  'saint-lucy': labradoodleImage,
  'saint-barbara': cavalierImage,
  'saint-margaret': boxerImage,
  'saint-rita': malteseImage,
  'saint-bernadette': pugImage,
  'saint-joan': berneseseImage,
  'saint-therese': collieImage,
  'saint-monica': pomeranianImage,
  'saint-helena': papillonImage,
  'saint-elizabeth': dalmatianImage,
  'saint-anne': pemberrokeCorgiImage,
  'saint-martha': goldendoodleImage,
  'saint-magdalene': schnauzersImage,
  'saint-veronica': sheltieImage,
  'saint-anastasia': bostonTerrierImage,
  'saint-agatha': minPinImage,
  'saint-polycarp': sibHuskyImage,
  'saint-ignatius': pugMixImage,
  'saint-justin': cairnTerrierImage,
  'saint-cyprian': cockerSpanielImage,
  'saint-ambrose': goldenRetrieverImage,
  'saint-chrysostom': blackLabImage,
  'saint-basil': corgiImage,
  'saint-gregory': huskyImage,
};

export function getPuppyDisplayName(symbol: string): string {
  const puppyBreeds: { [key: string]: string } = {
    'saint-francis': 'Golden Retriever',
    'saint-mary': 'Black Lab',
    'saint-joseph': 'Corgi',
    'saint-anthony': 'Husky',
    'saint-teresa': 'Bulldog',
    'saint-michael': 'Dachshund',
    'saint-peter': 'Poodle',
    'saint-john': 'Beagle',
    'saint-paul': 'German Shepherd',
    'saint-luke': 'Shiba Inu',
    'saint-mark': 'Labradoodle',
    'saint-matthew': 'Cavalier',
    'saint-gabriel': 'Boxer',
    'saint-raphael': 'Maltese',
    'saint-thomas': 'Pug',
    'saint-james': 'Bernese',
    'saint-andrew': 'Collie',
    'saint-bartholomew': 'Pomeranian',
    'saint-philip': 'Papillon',
    'saint-simon': 'Dalmatian',
    'saint-jude': 'Pembroke Corgi',
    'saint-matthias': 'Goldendoodle',
    'saint-stephen': 'Schnauzer',
    'saint-lawrence': 'Sheltie',
    'saint-sebastian': 'Boston Terrier',
    'saint-christopher': 'Min Pin',
    'saint-patrick': 'Siberian Husky',
    'saint-george': 'Pug Mix',
    'saint-nicholas': 'Cairn Terrier',
    'saint-valentine': 'Cocker Spaniel',
    'saint-martin': 'Golden Retriever',
    'saint-augustine': 'Black Lab',
    'saint-jerome': 'Corgi',
    'saint-bernard': 'Husky',
    'saint-dominic': 'Bulldog',
    'saint-aquinas': 'Dachshund',
    'saint-catherine': 'Poodle',
    'saint-agnes': 'Beagle',
    'saint-clare': 'German Shepherd',
    'saint-cecilia': 'Shiba Inu',
    'saint-lucy': 'Labradoodle',
    'saint-barbara': 'Cavalier',
    'saint-margaret': 'Boxer',
    'saint-rita': 'Maltese',
    'saint-bernadette': 'Pug',
    'saint-joan': 'Bernese',
    'saint-therese': 'Collie',
    'saint-monica': 'Pomeranian',
    'saint-helena': 'Papillon',
    'saint-elizabeth': 'Dalmatian',
    'saint-anne': 'Pembroke Corgi',
    'saint-martha': 'Goldendoodle',
    'saint-magdalene': 'Schnauzer',
    'saint-veronica': 'Sheltie',
    'saint-anastasia': 'Boston Terrier',
    'saint-agatha': 'Min Pin',
    'saint-polycarp': 'Siberian Husky',
    'saint-ignatius': 'Pug Mix',
    'saint-justin': 'Cairn Terrier',
    'saint-cyprian': 'Cocker Spaniel',
    'saint-ambrose': 'Golden Retriever',
    'saint-chrysostom': 'Black Lab',
    'saint-basil': 'Corgi',
    'saint-gregory': 'Husky',
  };
  return puppyBreeds[symbol] || 'Puppy';
}

export const puppySymbols = Object.keys(puppyImages);

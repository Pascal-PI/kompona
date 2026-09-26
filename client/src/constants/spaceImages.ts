import sunImage from '@assets/space_theme/sun.png';
import earthImage from '@assets/space_theme/earth.png';
import marsImage from '@assets/space_theme/mars.png';
import jupiterImage from '@assets/space_theme/jupiter.png';
import saturnImage from '@assets/space_theme/saturn.png';
import moonImage from '@assets/space_theme/moon.png';
import mercuryImage from '@assets/space_theme/mercury.png';
import venusImage from '@assets/space_theme/venus.png';
import neptuneImage from '@assets/space_theme/neptune.png';
import uranusImage from '@assets/space_theme/uranus.png';
import plutoImage from '@assets/space_theme/pluto.png';
import astronautImage from '@assets/space_theme/astronaut.png';
import rocketImage from '@assets/space_theme/rocket.png';
import shuttleImage from '@assets/space_theme/space-shuttle.png';
import ufoImage from '@assets/space_theme/ufo.png';
import alienImage from '@assets/space_theme/alien.png';
import satelliteImage from '@assets/space_theme/satellite.png';
import stationImage from '@assets/space_theme/space-station.png';
import galaxyImage from '@assets/space_theme/galaxy.png';
import blackHoleImage from '@assets/space_theme/black-hole.png';
import nebulaImage from '@assets/space_theme/nebula.png';
import cometImage from '@assets/space_theme/comet.png';
import asteroidImage from '@assets/space_theme/asteroid.png';
import starClusterImage from '@assets/space_theme/star-cluster.png';
import telescopeImage from '@assets/space_theme/telescope.png';
import roverImage from '@assets/space_theme/mars-rover.png';
import landerImage from '@assets/space_theme/lunar-lander.png';
import solarSystemImage from '@assets/space_theme/solar-system.png';
import orionImage from '@assets/space_theme/orion.png';
import meteorImage from '@assets/space_theme/meteor.png';
import supernovaImage from '@assets/space_theme/supernova.png';
import helmetImage from '@assets/space_theme/space-helmet.png';

const symbolToSpace: Array<[string, string, string]> = [
  ['saint-francis',     sunImage,         'Sun'],
  ['saint-mary',        earthImage,       'Earth'],
  ['saint-joseph',      marsImage,        'Mars'],
  ['saint-anthony',     jupiterImage,     'Jupiter'],
  ['saint-teresa',      saturnImage,      'Saturn'],
  ['saint-michael',     moonImage,        'Moon'],
  ['saint-peter',       mercuryImage,     'Mercury'],
  ['saint-john',        venusImage,       'Venus'],
  ['saint-paul',        neptuneImage,     'Neptune'],
  ['saint-luke',        uranusImage,      'Uranus'],
  ['saint-mark',        plutoImage,       'Pluto'],
  ['saint-matthew',     astronautImage,   'Astronaut'],
  ['saint-gabriel',     rocketImage,      'Rocket'],
  ['saint-raphael',     shuttleImage,     'Space Shuttle'],
  ['saint-thomas',      ufoImage,         'UFO'],
  ['saint-james',       alienImage,       'Alien'],
  ['saint-andrew',      satelliteImage,   'Satellite'],
  ['saint-bartholomew', stationImage,     'Space Station'],
  ['saint-philip',      galaxyImage,      'Galaxy'],
  ['saint-simon',       blackHoleImage,   'Black Hole'],
  ['saint-jude',        nebulaImage,      'Nebula'],
  ['saint-matthias',    cometImage,       'Comet'],
  ['saint-stephen',     asteroidImage,    'Asteroid'],
  ['saint-lawrence',    starClusterImage, 'Star Cluster'],
  ['saint-sebastian',   telescopeImage,   'Telescope'],
  ['saint-christopher', roverImage,       'Mars Rover'],
  ['saint-patrick',     landerImage,      'Lunar Lander'],
  ['saint-george',      solarSystemImage, 'Solar System'],
  ['saint-nicholas',    orionImage,       'Orion'],
  ['saint-valentine',   meteorImage,      'Meteor'],
  ['saint-martin',      supernovaImage,   'Supernova'],
  ['saint-augustine',   helmetImage,      'Space Helmet'],
];

export const spaceImages: { [key: string]: string } = Object.fromEntries(
  symbolToSpace.map(([sym, img]) => [sym, img])
);

const spaceNames: { [key: string]: string } = Object.fromEntries(
  symbolToSpace.map(([sym, , name]) => [sym, name])
);

export function getSpaceDisplayName(symbol: string): string {
  if (spaceNames[symbol]) return spaceNames[symbol];
  const stripped = symbol.replace(/^saint-/, '');
  return stripped
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

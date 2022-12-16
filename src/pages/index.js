import { useRef, useState, useEffect } from 'react';
import Head from 'next/head';
import Webcam from 'react-webcam';
import { Cloudinary } from '@cloudinary/url-gen';

import Layout from '@components/Layout';
import Container from '@components/Container';
import Button from '@components/Button';

import styles from '@styles/Home.module.scss';

const cameraWidth = 720;
const cameraHeight = 720;
const aspectRatio = cameraWidth / cameraHeight;

const videoConstraints = {
  width: {
    min: cameraWidth
  },
  height: {
    min: cameraHeight
  },
  aspectRatio
};

const cloudinary = new Cloudinary({
  cloud: {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  },
  url: {
    secure: true
  }
});

const OVERLAYS = [
  'my-camera-filters-assets:vader_helmet'
];

const ART_FILTERS = [
  'al_dente',
  'athena',
  'audrey',
  'aurora',
  'daguerre',
  'eucalyptus',
  'fes',
  'frost',
  'hairspray',
  'hokusai',
  'incognito',
  'linen',
  'peacock',
  'primavera',
  'quartz',
  'red_rock',
  'refresh',
  'sizzle',
  'sonnet',
  'ukulele',
  'zorro'
];

export default function Home() {
  const webcamRef = useRef();

  const [image, setImage] = useState();
  const [cldData, setCldData] = useState();
  const [filter, setFilter] = useState();
  const [overlay, setOverlay] = useState();

  let src = image;
  const cldImage = cldData && cloudinary.image(cldData.public_id);

  if ( cldImage ) {
    if ( overlay ) {
      cldImage.addTransformation(`l_${overlay}/fl_layer_apply,fl_relative,g_faces,h_1.2,y_-0.05`)
    }
    if ( filter ) {
      cldImage.effect(`e_art:${filter}`);
    }
    src = cldImage.toURL();
  }

  useEffect(() => {
    if ( !image ) return;

    (async function run() {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({
          image
        })
      }).then(r => r.json());
      setCldData(response);
    })();
  }, [image]);

  function handleCaptureScreenshot() {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }

  return (
    <Layout>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <div className={styles.camera}>

          <div className={styles.stageContainer}>
            <div className={styles.stage}>
              { src && (
                <img src={src} />
              )}
              {!src && (
                <Webcam ref={webcamRef} videoConstraints={videoConstraints} width={cameraWidth} height={cameraHeight} />
              )}
            </div>
          </div>

          <div className={styles.controls}>
            <ul>
              <li>
                <Button onClick={handleCaptureScreenshot}>
                  Capture photo
                </Button>
              </li>
              <li>
                <Button onClick={() => setImage(undefined) && setCldData(undefined)} color="red">
                  Reset
                </Button>
              </li>
            </ul>
          </div>
        </div>

        {cldData && (
          <div className={styles.effects}>
            <h2>Overlays</h2>
            <ul className={styles.filters}>
              {OVERLAYS.map(overlay => {
                return (
                  <li key={overlay} data-is-active-filter={false}>
                    <button className={styles.filterThumb} onClick={() => setOverlay(overlay)}>
                      <img width="100" height="100" src={
                        cloudinary.image(cldData?.public_id)
                          .resize('w_200,h_200')
                          .addTransformation(`l_${overlay}/fl_layer_apply,fl_relative,g_faces,h_1.2,y_-0.05`)
                          .toURL()
                      } alt={overlay} />
                      <span>{ overlay }</span>
                    </button>
                  </li>
                )
              })}
            </ul>
            <h2>Filters</h2>
            <ul className={styles.filters}>
              {ART_FILTERS.map(filter => {
                return (
                  <li key={filter} data-is-active-filter={false}>
                    <button className={styles.filterThumb} onClick={() => setFilter(filter)}>
                      <img width="100" height="100" src={
                        cloudinary.image(cldData?.public_id)
                          .resize('w_200,h_200')
                          .effect(`e_art:${filter}`)
                          .toURL()
                      } alt={filter} />
                      <span>{ filter }</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </Container>
    </Layout>
  )
}
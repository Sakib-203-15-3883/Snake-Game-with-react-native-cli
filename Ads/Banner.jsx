import React, { useState, useRef } from 'react';

import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-8504264785596008~3374875166';

const  BannerAds = () => {
  

  

  return (
    <BannerAd  unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
  );
}

export default BannerAds ;
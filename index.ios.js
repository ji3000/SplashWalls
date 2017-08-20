/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Dimensions,
  PanResponder,
  CameraRoll,
  Alert
} from 'react-native';

import Swiper from 'react-native-swiper';
import NetworkImage from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import ShakeEvent from 'react-native-shake-event';

var RandManager = require('./RandManager.js');
var Utils = require('./Utils.js');
import ProgressHUD from './ProgressHUD';

const {width, height} = Dimensions.get('window');

const NUM_WALLPAPERS = 2;
const DOUBLE_TAP_DELAY = 300; //ms
const DOUBLE_TAP_RADIUS = 20;

export default class SplashWalls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      wallsJSON: [],
      isLoading: true,
      isHudVisible: false
    };

    this.imagePanResponder = {};
    this.prevTouchInfo = {
      prevTouchX: 0,
      prevTouchY: 0,
      prevTouchTimeStamp: 0
    };

    this.handlePanResponderGrant = this.handlePanResponderGrant.bind(this);
    this.onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);

    this.currentWallIndex = 0;
  }

  fetchWallsJSON() {
    console.log('Wallpapers will be fetched');

    var url = "https://unsplash.it/list";
    fetch(url)
      .then( res => res.json() )
      .then( (jsonData) => {
        console.log(jsonData);

        var randomIds = RandManager.uniqueRandomNumbers(NUM_WALLPAPERS, 0, jsonData.length);
        var walls = [];
        randomIds.forEach(randomId => {
          walls.push(jsonData[randomId]);
        });

        this.setState({
          isLoading: false,
          wallsJSON: [].concat(walls)
        });
      })
    .catch(err => console.log("Fetch error " + err) );
  }

  componentWillMount() {
    this.imagePanResponder = PanResponder.create({
      onStartShouldSetPanResponder: this.handleStartShouldSetPanResponder,
      onPanResponderGrant: this.handlePanResponderGrant,
      onPanResponderRelease: this.handlePanResponderEnd,
      onPanresponderTerminate: this.handlePanResponderEnd
    });

    ShakeEvent.addEventListener('shake', () => {
      this.initialize();
      this.fetchWallsJSON();
    });
  }

  initialize() {
    this.setState({
      wallsJSON: [],
      isLoading: true,
      isHudVisible: false
    });

    this.currentWallIndex=0;
  }

  handleStartShouldSetPanResponder(e, gestureState) {
    return true;
  }

  handlePanResponderGrant(e, gestureState) {
    console.log('Finger touched the image');
    var currentTouchTimeStamp = Date.now();
    if( this.isDoubleTap(currentTouchTimeStamp, gestureState) ) {
      console.log('Double tap detected');

      this.saveCurrentWallpaperToCameraRoll();
    }


    this.prevTouchInfo = {
      prevTouchX: gestureState.x0,
      prevTouchY: gestureState.y0,
      prevTouchTimeStamp: currentTouchTimeStamp
    };
  }

  handlePanResponderEnd(e, gestureState) {
    console.log('Finger pulled up from the image');
  }

  isDoubleTap(currentTouchTimeStamp, {x0, y0}) {
    var {prevTouchX, prevTouchY, prevTouchTimeStamp} = this.prevTouchInfo;
    var dt = currentTouchTimeStamp - prevTouchTimeStamp;

    return (dt < DOUBLE_TAP_DELAY && Utils.distance(prevTouchX, prevTouchY, x0, y0) < DOUBLE_TAP_RADIUS);
  }

  onMomentumScrollEnd(e, state, context) {
    this.currentWallIndex = state.index;
  }

  saveCurrentWallpaperToCameraRoll() {
    this.setState({isHudVisible: true});

    var {wallsJSON} = this.state;
    var currentWall = wallsJSON[this.currentWallIndex];
    var currentWallURL = `http://unsplash.it/${currentWall.width}/${currentWall.height}?image=${currentWall.id}`;

    CameraRoll.saveToCameraRoll(currentWallURL).then((data) => {

        this.setState({isHudVisible: false});

        Alert.alert(
          'Saved',
          'Wallpaper successfully saved to Camera Roll',
          [
            {text: 'High 5!', onPress: () => console.log('OK Pressed!')}
          ]
        );
      }, err => {
        console.log('Error saving to camera roll', err);
      });
  }



  componentDidMount() {
    this.fetchWallsJSON();
  }

  renderLoadingMessage() {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          animating={true}
          color={'#fff'}
          size={'small'}
          style={{margin: 15}} />
          <Text style={{color: '#fff'}}>
            Contacting Unsplash
          </Text>
      </View>
    );
  }

  renderResults() {
    var {wallsJSON, isVisible, isHudVisible} = this.state;

    if(!isVisible) {
      return (
        <View style={styles.loadingContainer}>
          <Swiper
            dot={<View style={{backgroundColor:'rgba(255,2,72,.4)', width: 8, height: 8,borderRadius: 10, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 3,}} />}
            activeDot={<View style={{backgroundColor: '#abc', width: 13, height: 13, borderRadius: 7, marginLeft: 7, marginRight: 7}} />}
            loop={true}
            onMomentumScrollEnd={this.onMomentumScrollEnd}
            index={this.currentWallIndex}
            removeClippedSubviews={false}
            >
              {wallsJSON.map((wallpaper, index) => {
                return (
                  <View key={index}>
                    <NetworkImage
                      source={{uri: `https://unsplash.it/${wallpaper.width}/${wallpaper.height}?image=${wallpaper.id}`}}
                      indicator={Progress.Circle}
                      style={styles.wallpaperImage}
                      indicatorProps={{
                        color: 'rgba(100, 55, 55)',
                        size: 60,
                        thickness: 7
                      }}
                      threshold={0}
                      style={{ height: height, width: width }}
                      {...this.imagePanResponder.panHandlers}
                      >

                      <Text style={styles.label}>Photo by</Text>
                      <Text style={styles.label_authorName}>{wallpaper.author}</Text>
                    </NetworkImage>
                  </View>
                );
              })}
          </Swiper>
             <ProgressHUD width={width} height={height} isVisible={isHudVisible}/>
        </View>
      );
    }
  }


  render () {
    var {isLoading} = this.state;

    console.log('isLoading: ' + isLoading);

    if(isLoading)
      return this.renderLoadingMessage();
    else
      return this.renderResults();

    return (
      <View></View>
    );
  }

}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  wallpaperImage: {
    flex: 1,
    width: width,
    height: height,
    backgroundColor: '#000'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  label: {
    position: 'absolute',
    color: "#fff",
    fontSize: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 2,
    paddingLeft: 5,
    top: 20,
    left: 20,
    width: width/2
  },
  label_authorName: {
    position: 'absolute',
    color: '#fff',
    fontSize: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 2,
    paddingLeft: 5,
    top: 41,
    left: 20,
    fontWeight: 'bold',
    width: width/2
  }
});

AppRegistry.registerComponent('SplashWalls', () => SplashWalls);

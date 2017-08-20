'use strict';

//var React = require('react-native');
import React, { Component } from 'react';

import {
  View,
  Text,
  ActivityIndicator
} from 'react-native';

export default class ProgressHUD extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		var {width, height, isVisible} = this.props;
    console.log('Visible: ' + isVisible);
		if( isVisible ) {
			return(

				<View
				 style={{
				 	flex: 1,
				 	flexDirection: 'column',
				 	justifyContent: 'center',
				 	alignItems: 'center',
				 	width: width,
				 	height: height,
				 	position: 'absolute',
				 	top: 0,
				 	left: 0,
				 	backgroundColor: 'rgba(0, 0, 0, 0.5)'
				 }}>

				 <ActivityIndicator
	          animating={true}
	          color={'#fff'}
	          size={'large'}
	          style={{margin: 15}} />

           <Text style={{color: '#fff'}}>
             Please wait...
           </Text>
				</View>
			);
		} else {
			return(
        <View></View>
      );
		}
	}
};

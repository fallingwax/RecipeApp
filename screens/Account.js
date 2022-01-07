/* 
    David McFarland
    ITN263-4W1
    December 2, 2020
    Final Project - Recipe App
    v 1.1

   Using Data provided by TheMealDB API:  https://www.themealdb.com/api.php
*/
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, Dimensions, ToastAndroid, View ,Platform, InteractionManager } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import firebaseSDK from '../config/firebaseSDK';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Signup from '../screens/Signup';
import { createStackNavigator } from '@react-navigation/stack';

const _setTimeout = global.setTimeout;
const _clearTimeout = global.clearTimeout;
const MAX_TIMER_DURATION_MS = 60 * 1000;
if (Platform.OS === 'android') {
// Work around issue `Setting a timer for long time`
// see: https://github.com/firebase/firebase-js-sdk/issues/97
    const timerFix = {};
    const runTask = (id, fn, ttl, args) => {
        const waitingTime = ttl - Date.now();
        if (waitingTime <= 1) {
            InteractionManager.runAfterInteractions(() => {
                if (!timerFix[id]) {
                    return;
                }
                delete timerFix[id];
                fn(...args);
            });
            return;
        }

        const afterTime = Math.min(waitingTime, MAX_TIMER_DURATION_MS);
        timerFix[id] = _setTimeout(() => runTask(id, fn, ttl, args), afterTime);
    };

    global.setTimeout = (fn, time, ...args) => {
        if (MAX_TIMER_DURATION_MS < time) {
            const ttl = Date.now() + time;
            const id = '_lt_' + Object.keys(timerFix).length;
            runTask(id, fn, ttl, args);
            return id;
        }
        return _setTimeout(fn, time, ...args);
    };

    global.clearTimeout = id => {
        if (typeof id === 'string' && id.startsWith('_lt_')) {
            _clearTimeout(timerFix[id]);
            delete timerFix[id];
            return;
        }
        _clearTimeout(id);
    };
    
}

// Get the current screens width and height and for styles
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

class Account extends Component {
    constructor(props) {
    super();

        this.state = {
            email: null, 
            password: null,
            authenticated: false,
            user: null
        }
    }

    // login user
    onPressLogin = async () => {
		const user = {
			email: this.state.email,
			password: this.state.password,
		};

		const response = firebaseSDK.login(
			user,
			this.loginSuccess,
			this.loginFailed
		);
    };
    
    // show a toast message if logged in
    loginSuccess = () => {
      if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity('Login successful', ToastAndroid.SHORT, ToastAndroid.BOTTOM)
      } else {
        alert('Login successful');
      }
        // set authentication set and store information to AsyncStorage
        this.setState({authenticated: true})
        this.storeData({user: this.state.email, authenticated: true})
  };
  
  // show toast message if login failed
	loginFailed = () => {
    if (Platform.OS === 'android') {
      ToastAndroid.showWithGravity('Login Falilure', ToastAndroid.SHORT, ToastAndroid.BOTTOM)
    } else {
      alert('Login failure.');
    }
		
  };
  
  // logout user, unset AsyncStorage data
  logOut = () => {
    this.setState({authenticated: false})
    this.storeData({user: null, authenticated: false})
    firebaseSDK.onLogout
  }

  // set an object called userData for AsyncStorage to be used globally throughtout the app
  storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value)
      await AsyncStorage.setItem('userData', jsonValue)
    } catch (e) {
      // saving error
    }
  }

  // getData from AsyncStorage to test if used is logged in already
  getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('userData')
        // value previously stored
        var jsonParse = JSON.parse(jsonValue);

        if (jsonParse.authenticated)
            this.setState({authenticated:true})
            this.setState({user:jsonParse.user})

    } catch(e) {
      // error reading value
    }
  }

  //lifecycle.  test user on mount
  componentDidMount() {

    this.getData()
    
  }
 

  render() {  

    // Set up login screen and give option to sign up. 
    return (
        <View style={styles.container}>
            {!this.state.authenticated && (
                <View style={styles.container}>
                  <View style={styles.formField}>
                      <TextInput 
                          style={styles.textInput}
                          returnKeyType="next"
                          keyboardType='email-address'
                          onSubmitEditing={() => this.passwordTextInput.focus()}
                          onChangeText={email => this.setState({email})}
                          autoCapitalize= 'none'
                          value={this.state.email}
                          placeholder="Email Address"
                      ></TextInput>
                  </View>
                  <View style={styles.formField}>
                      <TextInput
                          style={styles.textInput}
                          keyboardType="default"
                          secureTextEntry
                          returnKeyType="go"
                          autoCorrect={false}
                          autoCapitalize= 'none'
                          ref={p => {this.passwordTextInput = p}}
                          onChangeText={password => this.setState({password})}
                          onSubmitEditing={() => this.buttonPosition.focus()}
                          value={this.state.password}
                          placeholder="Password"
                      ></TextInput>
                  </View>
                  <TouchableOpacity
                      onPress={() => this.props.navigation.navigate('Sign Up')}
                  >
                      <Text style={styles.link}>Don't have an account? Sign Up Here</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                      style={styles.button}
                      ref={b => {this.buttonPosition = b}}
                      onPress={this.onPressLogin}
                  >
                      <Text style={styles.buttonText}>Login</Text>
                  </TouchableOpacity>
                </View>
              )}
            {this.state.authenticated && (
                 <View style={styles.container}>
                  <Text>{this.state.email} Logged In</Text>
                  <TouchableOpacity
                      style={styles.buttonRed}
                      ref={b => {this.buttonPosition = b}}
                      onPress={this.logOut}
                  >
                      <Text style={styles.buttonText}>Logout</Text>
                  </TouchableOpacity>
                 </View>
            )}
            
        </View>
    )
  }
}

// set up stack navigator
const Stack = createStackNavigator();


class AccountView extends Component {
    render() {
        return (
                <Stack.Navigator 
                    initialRouteName="Account"
                    headerMode= 'screen'
                    // remove shadow from under the header
                    screenOptions= {{
                        headerStyle: {elevation: 0}
                    }}
                >
                    <Stack.Screen
                        name="Account"
                        component={Account}
                        options={{
                            title: 'Account',
                            headerTitleAlign: 'center',
                            headerTintColor: '#379eff'
                        }}
                        
                    />
                    <Stack.Screen
                        name="Sign Up"
                        component={Signup}
                        options={{
                        }}
                    />
                </Stack.Navigator>
        )
    }
}

export default AccountView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textInput: {
    backgroundColor: '#fff',
    width: windowWidth - 60,
    borderRadius: 5,
    height: 40,
  },
  formField: {
    borderBottomWidth: 1,
    borderColor: 'black',
    margin: 15,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#5cb85c',
    borderRadius: 25,
    borderColor: '#4cae4c',
    borderWidth: 1,
    height: 50,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRed: {
    marginTop: 10,
    backgroundColor: 'red',
    borderRadius: 25,
    borderColor: 'red',
    borderWidth: 1,
    height: 50,
    width: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
      color: '#fff',
      fontSize: 18,
  },
  link: {
    textDecorationLine: 'underline',
    color: 'blue',
  }
});

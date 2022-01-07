/* 
    David McFarland
    ITN263-4W1
    December 2, 2020
    Final Project - Recipe App
    v 1.1

   Using Data provided by TheMealDB API:  https://www.themealdb.com/api.php
*/
import React, { Component } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, RefreshControl, Dimensions, Platform, InteractionManager } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import firebaseSDK from '../config/firebaseSDK';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';
import Recipe from '../screens/Recipe';

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
const windowHeight = Dimensions.get('window').height

const wait = (timeout) => {
  return new Promise(resolve => {
    setTimeout(resolve, timeout);
  });
}

class FavoritesPage extends Component {
    constructor(props) {
    super();

       /* 
            states
                @loaded boolean - for main categories
                @imagePath - for image at the top of display
                @recipeName - recipe name
                @authenticated & @user - used for authentication
                @recipes array - recipe information 
                @recipesLoaded boolean - for testing loading
                @data array - return from API call
        */ 

        this.state = {
            loaded: false,
            imagePath: null,
            recipeName: null,
            authenticated: false,
            user: null,
            recipes: [],
            recipesLoaded: false,
        }
    }

    // getData() testing for authentication
    getData = async () => {
      try {
         const jsonValue = await AsyncStorage.getItem('userData')
          // value previously stored
          const jsonParse = JSON.parse(jsonValue);

          if (jsonParse.authenticated)
              this.setState({authenticated:true}),
              this.setState({user:jsonParse.user}),
              this.getFavorites(jsonParse.user)

          else 
            this.setState({authenticated:false})
            this.setState({recipesLoaded:false})
  
      } catch(e) {
        // error reading value
      }
    }

    /*
      getFavorites (@param user) takes in the user and gets a snapshot of saved data from firebase realtime-db
      and loops through the returned data and pushs the id and name into an array to be rendered. 
      */
    getFavorites = async (user) => {
      const recipes = await firebaseSDK.getRecipe(user)
      let recipeArray = [];

      if (recipes)
        for (const [key, value] of Object.entries(recipes)) {
          recipeArray.push({id:value.recipeId,title:value.title});
        } 
        console.log(recipeArray);

      if (recipeArray.length === 0)
        recipeArray.push({id:"",title:""})

      this.setState({recipes:recipeArray}),
      this.setState({recipesLoaded:true})
    }

    // showData(@param JSON) takes in json and states image and name sets from returned values
    showData = (data) => {
        this.setState({loaded:true, data})
        console.log(this.state.data)
        
    }

    // handle errors
    errors = (err) => {
        this.setState({loaded: true, error:"No Results"})
        this.setState({name:""})
        this.setState({image:null})
    }

    //lifecycle. get authentication at mount and setup listener
    componentDidMount() {
        this.getData()


      this.focusListener = this.props.navigation.addListener('focus', () => {
        this.getData();
        //Put your Data loading function here instead of my this.LoadData()
    });
    }

    

  render() {

    // function onRefresh sets refrshing state to true, calls for a new feature recipe and then resets. Used with the RefreshControl of ScrollView
    const onRefresh = () => {
        this.setState({refreshing:true});
        this.setState({refreshing:false}),
        this.getData()

    }
    
    // function to display favorites recipes. 
    const mapRecipes = () => {

      // onPress function for trash can icon, delete recipe from list and call getData to refresh information
      const deleteRecipe = (user, id) => {

        firebaseSDK.deleteRecipe(user, id)
        this.getData()
      }

      // loop through favorites array with the map function
      return this.state.recipes.map((data) => {
          return (
          <View key={data.id} style={styles.recipeRow}>
            <TouchableOpacity
                onPress={
                    () => this.props.navigation.navigate("Recipe", {
                        recipeID: data.id,
                        recipeName: data.title
                    }
                    )
                }
                style={styles.nameWrapper}
            >
              <Text style={styles.recipeName}>{data.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.recipeIcon}
              onPress={() => deleteRecipe(this.state.user, data.id)}
            >
              {data.id.length > 0 && (
                <MaterialCommunityIcons name="trash-can-outline" color="red" size={25} />
              )}
                
            </TouchableOpacity>
          </View>
          )
      }) 
    }

    return (
          <View style={styles.containerLoggedOut}>
            {!this.state.authenticated && (
              <View >
                <Text>Must be logged in to save recipes</Text>
              </View>
            )}
            {this.state.authenticated && (
              this.state.recipesLoaded && (
                <ScrollView 
                    style={styles.container}
                    refreshControl={
                        <RefreshControl refreshing={this.state.refreshing} onRefresh={onRefresh} />
                }
                >
                <View style={styles.recipeWrapper}>
                  {mapRecipes()}
                </View>
               </ScrollView> 

                )
              )
            }
          
            </View>


    )}
  }
            
  //set up stack navigator
  const Stack = createStackNavigator();

  class FavoritesView extends Component {
      render() {
          return (
                  <Stack.Navigator 
                      initialRouteName="Favorites Page"
                      headerMode= 'screen'
                      // remove shadow from under the header
                      screenOptions= {{
                          headerStyle: {elevation: 0}
                      }}
                  >
                      <Stack.Screen
                          name="Favorites Page"
                          component={FavoritesPage}
                          options={{
                              title: 'Favorites',
                              headerTitleAlign: 'center',
                              headerTintColor: '#379eff'
                          }}
                          
                      />
                      <Stack.Screen
                          name="Recipe"
                          component={Recipe}
                          options={{
                          }}
                      />
                  </Stack.Navigator>
          )
      }
  }
  
  export default FavoritesView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerLoggedOut: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: {
      fontFamily: 'sans-serif',
      marginTop: -200,
      color: '#42e3ff',
      fontSize: 40,
      fontWeight: 'bold',
      width: 300,
      padding: 5,
      textShadowColor: 'rgba(0, 0, 0, 0.75)',
      textShadowOffset: {width: -1, height: 1},
      textShadowRadius: 10
  },
  recipeWrapper: {
    height: 'auto',
    backgroundColor:'#fff',
    width: windowWidth,
    elevation: 1,
    justifyContent: 'center'
},
recipeRow: {
    height: 70,
    width: windowWidth,
    borderTopColor: '#f2f0ee',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
},
nameWrapper: {
  alignSelf: 'flex-start',
  width: windowWidth - 20,
  marginTop: 20,
},
recipeName: {
    fontSize: 16,
    color: '#7d7b79',
    width: windowWidth - 80,
    paddingLeft: 10,
    lineHeight: 22,
},
recipeIcon: {
    alignSelf: 'flex-end',
    bottom: 23,
    right: 30,
},

});

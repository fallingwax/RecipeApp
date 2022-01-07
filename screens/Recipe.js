/* 
    David McFarland
    ITN263-4W1
    December 2, 2020
    Final Project - Recipe App
    v 1.1

   Using Data provided by TheMealDB API:  https://www.themealdb.com/api.php
*/
import React, { Component } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions, Platform, InteractionManager, } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import firebaseSDK from '../config/firebaseSDK';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CheckBox from '@react-native-community/checkbox';

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

// a wait variable for troubleshooting timer issues
const wait = (timeout) => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

/* 
    class Recipe
    Displays the details of a recipe
*/
class Recipe extends Component {

    constructor(props) {
        super();
    
        /* 
            states
                @loaded boolean - for main categories
                @recipeID - recipe id passed to the route
                @authenticated & @user - used for authentication
                @isSelected - used to set the state of checkboxes
                @data array - return from API call
        */ 

            this.state = {
                loaded: false,
                recipeID: props.route.params.recipeID,
                authenticated: false,
                user: null,
                isSelected: null,
                isSelected2: null,
                isSelected3: null,
                isSelected4: null,
                isSelected5: null,
                isSelected6: null,
                isSelected7: null,
                isSelected8: null,
                isSelected9: null,
                isSelected10: null,
                isSelected11: null,
                isSelected12: null,
                isSelected13: null,
                isSelected14: null,
                isSelected15: null,
                isSelected16: null,
                isSelected17: null,
                isSelected18: null,
                isSelected19: null,
                data: []
            }
        }

        
    
        // showData(@param JSON) takes in json and states image and name sets from returned values
        showData = (data) => {
            this.setState({loaded:true, data:data.meals[0]})
            console.log(this.state.data)
        }
    
        // handle errors
        errors = (err) => {
            this.setState({loaded: true, error:"No Results"})
            this.setState({name:""})
            this.setState({image:null})
        }

        // getData() testing for authentication
        getData = async () => {
            try {
            // Using AsyncStorage to check authentication
              const jsonValue = await AsyncStorage.getItem('userData')
                // value previously stored
                var jsonParse = JSON.parse(jsonValue);
        
                //if authenticated user
                if (jsonParse.authenticated) {
                    this.setState({authenticated:true})
                    this.setState({user:jsonParse.user})
                }
                else 
                    this.setState({authenticated:false})
        
            } catch(e) {
              // error reading value
            }
          }
    
        // lifecycle.  Called when component is mounted.  
        componentDidMount() {

            // get authentication
            this.getData()

            // the meal db
            let url = 'https://www.themealdb.com/api/json/v1/1/lookup.php?i='
            
            // request data from API
            let request = new Request(url+this.state.recipeID,
                {
                method: 'GET'
                });
            
            //fetch call
            fetch(request)
            .then(response=>response.json())
            .then(this.showData)
            .catch(this.errors)


            // set listener to reconfirm authencation when this component is in focus
            this.focusListener = this.props.navigation.addListener('focus', () => {
                this.getData();

            });

        }

    render() {

        return (
            <View
                style={styles.recipeContainer}
            >
                {this.state.loaded === true && (
                    <ScrollView
                    >
                        <Image  
                            source={{uri:this.state.data.strMealThumb}}
                            style={{width: windowWidth, height: 300,}}
                        />
                        <View style={styles.recipeWrapper}>
                            {/* If authenticated, add a heart icon to favorite the recipe. */}
                            {this.state.authenticated && (
                                <TouchableOpacity
                                style={{
                                    alignSelf: 'flex-end',
                                    marginRight: 10,
                                    top: 35,
                                    width: 25,
                                    height: 25,
                                }}
                                    onPress = {() => firebaseSDK.saveRecipe(this.state.user, this.state.data.strMeal, this.state.data.idMeal)}

                                >                                                           
                                    <MaterialCommunityIcons name="heart-outline" color="red" size={20}/>
                                </TouchableOpacity>
                            )}
                            <Text style={styles.recipeTitle}>{this.state.data.strMeal}</Text>
                            <Text style={styles.h2}>Ingredients</Text>
                            {/* Ingredients from the API are listed with measurements and ingredients separated. 
                                This code is looking at the json and parsing each line individually.  #FIXME, in the next revision
                                build this to use a for loop to tighten up the code */}
                            {this.state.data.strIngredient1 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected}
                                        onValueChange={(newValue) => this.setState({isSelected: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure1} {this.state.data.strIngredient1}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient2 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected2}
                                        onValueChange={(newValue) => this.setState({isSelected2: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure2} {this.state.data.strIngredient2}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient3 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected3}
                                        onValueChange={(newValue) => this.setState({isSelected3: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure3} {this.state.data.strIngredient3}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient4 !== "" && (
                                <View style={styles.ingredientWrapper}>  
                                    <CheckBox
                                        value={this.state.isSelected4}
                                        onValueChange={(newValue) => this.setState({isSelected4: newValue})}
                                        style={styles.checkbox}
                                    /> 
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure4} {this.state.data.strIngredient4}</Text>
                                </View> 
                            )}
                            {this.state.data.strIngredient5 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected5}
                                        onValueChange={(newValue) => this.setState({isSelected5: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure5} {this.state.data.strIngredient5}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient6 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected6}
                                        onValueChange={(newValue) => this.setState({isSelected6: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure6} {this.state.data.strIngredient6}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient7 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected7}
                                        onValueChange={(newValue) => this.setState({isSelected7: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure7} {this.state.data.strIngredient7}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient8 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected8}
                                        onValueChange={(newValue) => this.setState({isSelected8: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure8} {this.state.data.strIngredient8}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient9 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected9}
                                        onValueChange={(newValue) => this.setState({isSelected9: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure9} {this.state.data.strIngredient9}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient10 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected10}
                                        onValueChange={(newValue) => this.setState({isSelected10: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure10} {this.state.data.strIngredient10}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient11 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected11}
                                        onValueChange={(newValue) => this.setState({isSelected11: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure11} {this.state.data.strIngredient11}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient12 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected12}
                                        onValueChange={(newValue) => this.setState({isSelected12: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure12} {this.state.data.strIngredient12}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient13 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected13}
                                        onValueChange={(newValue) => this.setState({isSelected13: newValue})}
                                        style={styles.checkbox}
                                    />
                                <Text style={styles.ingredients}>{this.state.data.strMeasure13} {this.state.data.strIngredient13}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient14 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected14}
                                        onValueChange={(newValue) => this.setState({isSelected14: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure14} {this.state.data.strIngredient14}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient15 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected15}
                                        onValueChange={(newValue) => this.setState({isSelected15: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure15} {this.state.data.strIngredient15}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient16 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected16}
                                        onValueChange={(newValue) => this.setState({isSelected16: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure16} {this.state.data.strIngredient16}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient17 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected17}
                                        onValueChange={(newValue) => this.setState({isSelected17: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure17} {this.state.data.strIngredient17}</Text>
                                </View>
                            )}
                            {this.state.data.strIngredient18 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected18}
                                        onValueChange={(newValue) => this.setState({isSelected18: newValue})}
                                        style={styles.checkbox}
                                    />
                                <Text style={styles.ingredients}>{this.state.data.strMeasure18} {this.state.data.strIngredient18} </Text>
                                </View>
                            )}
                            {this.state.data.strIngredient19 !== "" && (
                                <View style={styles.ingredientWrapper}>
                                    <CheckBox
                                        value={this.state.isSelected19}
                                        onValueChange={(newValue) => this.setState({isSelected19: newValue})}
                                        style={styles.checkbox}
                                    />
                                    <Text style={styles.ingredients}>{this.state.data.strMeasure19} {this.state.data.strIngredient19}</Text>
                                </View>
                            )}
                            <Text style={styles.h2}>Instructions</Text>
                            <Text style={styles.instructions}>{this.state.data.strInstructions}</Text>
                            <Text style={styles.h2}>Video How-To</Text>
                            {/* WebView is being called because of issues with the native youtube player and expo. Using the webview
                                allows me to size the video correctly with out a lot of additional processing. The URL that is supplied 
                                from the API is not the embedded youtube link but the direct link and was causing issue with the playback.
                                #FIXME, in a future revision, build out the react-player or react-youtube library */}
                            <View style={styles.videoWrapper}>
                                <WebView
                                    ref={this.webViewRef}
                                    allowsFullscreenVideo
                                    // useWebKit
                                    onLoad={this.webViewLoaded}
                                    allowsInlineMediaPlayback
                                    mediaPlaybackRequiresUserAction
                                    javaScriptEnabled
                                    scrollEnabled={false}
                                    source={{ uri: this.state.data.strYoutube }} 
                                    style={{height: 500, width: 340, opacity: .99}}
                                />
                            </View>
                        </View>
                    </ScrollView>    

                )}    
            </View>
        )
    }
}

export default Recipe;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingLeft: 5
    },
    headline: {
        marginTop: 10,
        paddingLeft: 8,
        fontSize: 16,
        fontWeight: 'bold'
    },
    searchBox: {
        backgroundColor:'#ebe6e3',
        width:windowWidth-40,
        alignSelf: 'center',
        borderRadius: 20,
        borderColor:'#ebe6e3',
        borderWidth:1,
        height: 40,
        flex: 1,
    },
    searchText: {
        alignSelf: 'flex-start',
        marginLeft: 25,
        top: 5,
        fontSize: 16,
        width: windowWidth - 100,
        color: 'black',
    },
    searchIcon: {
        alignSelf: 'flex-end',
        bottom: 20,
        right: 5
    },  
    resultsWrapper: {
        height: 'auto',
        backgroundColor:'#fff',
        width: '100%',
        elevation: 1,
        marginTop: 10,
    },
    resultEach: {
        height: 60,
        width: '100%',
        borderTopColor: '#f2f0ee',
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsName: {
        lineHeight: 22,
        paddingLeft: 10,
        fontSize: 16,
        color: '#7d7b79',
        flex: .9,
    },
    resultsChevron: {
        alignSelf: 'flex-end',
        marginBottom: 15,
        flex: .1,
    },
    recipeContainer: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative'
    },
    cardWrapper: {
        marginTop: 15,
        alignContent: 'center'
    },
    card: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#d1cdca',
        width: 300,
        height: 350,
        marginRight: 55,
        marginLeft: 5,
        justifyContent: 'flex-start'
    },
    imageWrapper: {
        height: 250,
        elevation: 2,
    },
    titleWrapper: {
        height: 100,
        padding: 5
    },

    title: {
        fontFamily: 'sans-serif',
        fontSize: 20,
        fontWeight: '200',
    },
    smallTitle: {
        fontFamily: 'sans-serif',
        marginTop: -200,
        color: '#42e3ff',
        fontSize: 28,
        fontWeight: 'bold',
        width: 300,
        padding: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: {width: -1, height: 1},
        textShadowRadius: 10
    },
    recipeWrapper: {
        padding: 5,
        marginBottom: -250
    },
    recipeTitle: {
        fontSize: 24, 
        width: 250
    },
    h2: {
        fontWeight: 'bold',
        fontSize: 20,
        marginTop: 20,
        marginBottom: 10
    },
    ingredientWrapper: {
        height: 60,
        width: windowWidth,
        borderTopColor: '#f2f0ee',
        borderTopWidth: 1,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    ingredients: {
        lineHeight: 22,
        paddingLeft: 10,
        fontSize: 16,
        color: '#7d7b79',
    },
    instructions: {
        lineHeight: 32,
        fontSize: 16,
        paddingLeft: 5
    },
    checkbox: {
        alignSelf: "center",
    },
    videoWrapper: {
        paddingRight: 5,
    },

});
/* 
    David McFarland
    ITN263-4W1
    December 2, 2020
    Final Project - Recipe App
    v 1.1

   Using Data provided by TheMealDB API:  https://www.themealdb.com/api.php
*/
import React, { Component } from 'react';
import { FlatList,Image, StyleSheet, Text, TouchableOpacity, View, ScrollView, Dimensions, TextInput,RefreshControl,Platform, InteractionManager } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import {Picker } from '@react-native-community/picker'
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
const windowHeight = Dimensions.get('window').height;

// a wait variable for troubleshooting timer issues
const wait = (timeout) => {
    return new Promise(resolve => {
      setTimeout(resolve, timeout);
    });
  }

/* 
    class RecipeImages
    Displays image and name of recipe for the main page of the application.
*/

class RecipeImages extends Component {
    constructor(props) {
    super();

    /* 
        states
            @loaded boolean - for main categories
            @featureLoaded boolean - for featured item loading
            @results array - for array of search results
            @resultsReturned boolean - to check for results
            @data array - return from API call
            @feature array - return from API call
    */ 
        this.state = {
            loaded: false,
            featureLoaded: false,
            imagePath: null,
            recipeName: null,
            data: [],
            feature: [],
            searchTerm: null,
            results: [],
            category: null,
            resultsReturned: false,
            refreshing: false,
        }

    }

    

    // showData(@param JSON) takes in json and sets the state loaded and data
    showData = (data) => {
        this.setState({loaded:true, data})
        
    }

    // saveFeature(@param JSON) takes in json and sets the state faetureLoaded and feature
    saveFeature = (data) => {
        this.setState({featureLoaded:true, feature:data})
        console.log(this.state.feature)
        
    }

    /* saveSearch(@param JSON) takes in json results and pushes the name and id into an array and the first three
    results are saved to the results state*/
    saveSearch = (data) => {
        var recipeTitles = []

        if (data.meals === null) {
            recipeTitles.push({name:'No Results',id:0})
        } else {
            for(let i = 0; i < data.meals.length; i++) {
                recipeTitles.push({name:data.meals[i].strMeal,id:data.meals[i].idMeal});  
            };        
        }
        this.setState({results:recipeTitles.splice(0,3)})
        this.setState({resultsReturned:true})

        console.log(this.state.results)
    }

    // handle errors
    errors = (err) => {
        this.setState({loaded: true, error:"No Results"})
        this.setState({name:""})
        this.setState({image:null})
        alert(err)
    }

    // getData(@param category) takes in category choice from picker and calls API and saves results
    getData = (category) => {

        this.setState({category})

        //themealdb api
        let url = 'https://www.themealdb.com/api/json/v1/1/filter.php?'

        //request
        let request = new Request(url+'c='+category,
            {
            method: 'GET'
            });
        
        //fetch call
        fetch(request)
        .then(response=>response.json())
        .then(this.showData)
        .catch(this.errors)
    }

    // getFeature() calls API for one random recipe and stores it in a state
    getFeature = () => {

        //themealdb api
        let url = 'https://www.themealdb.com/api/json/v1/1/random.php'

        //request
        let request = new Request(url,
            {
            method: 'GET'
            });
        
        //fetch call
        fetch(request)
        .then(response=>response.json())
        .then(this.saveFeature)
        .catch(this.errors)
    }

    // lifecycle. Get featured recipe and initial load of recipes. Set a focus listener to update states on refocus
    componentDidMount() {
        
            this.setState({loaded:false, error:null,searchTerm: null, results: null})
            this.getFeature()
            this.getData(this.state.category)

            this.focusListener = this.props.navigation.addListener('focus', () => {
                this.setState({searchTerm: null, resultsReturned: false})
                //Put your Data loading function here instead of my this.LoadData()
            });
        
    }

    //lifecycle. unsubscribe async calls here if needed
    componentWillUnmount() {

    }

    // searchResults(@param term) takes in search term and calls API and saves results
    searchResults = (term) => {

        //themealdb api
        let url = 'https://www.themealdb.com/api/json/v1/1/search.php?s='

        //request
        let request = new Request(url+term,
            {
            method: 'GET'
            });

            //fetch call
            fetch(request)
            .then(response=>response.json())
            .then(this.saveSearch)
            .catch(this.errors)
    }
    
    

  render() {  

    // function onRefresh sets refrshing state to true, calls for a new feature recipe and then resets. Used with the RefreshControl of ScrollView
    const onRefresh = () => {
        this.setState({refreshing:true});
        this.getFeature();
        this.setState({refreshing:false})
    }

    // Item Component used with renderItem for the FlatList
    const Item = ({ id, title, path }) => (
        
        <TouchableOpacity
            onPress={
                () => this.props.navigation.navigate("Recipe", {
                    recipeID: id,
                    recipeName: title
                }
                )
            }
        >
            <View style={styles.card}>
                <View style={styles.imageWrapper}>
                    <Image  
                        source={{uri:path}}
                        style={{width: 298, height: 250,borderTopLeftRadius: 20, borderTopRightRadius: 20}}
                    />
                </View>
                <View style={styles.titleWrapper}>
                    <Text
                        style={styles.title}
                    >{title}</Text>
                </View>
            </View>
        </TouchableOpacity>
      );

      
    // render Item component for the the FlatList
    const renderItem = ({ item }) => (
        <Item id={item.idMeal} title={item.strMeal} path={item.strMealThumb} />
    );

    // map the results array for search function
    const mapList = () => {
        return this.state.results.map((data) => {
            return (


            <View key={data.id}>
                {data.name === 'No Results' ?
                    <View style={styles.resultEach}>
                        <Text style={styles.resultsName}>{data.name}</Text>
                    </View>
                :
                <TouchableOpacity
                    onPress={
                        () => this.props.navigation.navigate("Recipe", {
                            recipeID: data.id,
                            recipeName: data.name
                        }
                        )
                    }
                    style={styles.resultEach}
                >
                    <Text style={styles.resultsName}>{data.name}</Text>
                    <MaterialCommunityIcons name="chevron-right" color="black" size={25} style={styles.resultsChevron}/>
                </TouchableOpacity>
        }
            </View>
            )
        }) 
    }

      

    return (
            // ScrollView with Refresh Control 
            <ScrollView 
                style={styles.container}
                refreshControl={
                    <RefreshControl refreshing={this.state.refreshing} onRefresh={onRefresh} />
            }
            >
                <View style={styles.searchBox}>
                    <TextInput 
                        style={styles.searchText}
                        placeholder="Search Recipes..."
                        onChangeText={(term) => this.setState({searchTerm:term})}
                        returnKeyType="search"
                        value={this.state.searchTerm}
                        onSubmitEditing={() => this.searchResults(this.state.searchTerm)}
                    ></TextInput>
                    <TouchableOpacity
                        onPress={() => this.searchResults(this.state.searchTerm)}
                        style={styles.searchIcon}
                    >
                        <MaterialCommunityIcons name="magnify" color="black" size={25}/>
                    </TouchableOpacity>
                </View>

                {/* If results are returned from search, so results using mapList() function */}
                {this.state.resultsReturned && (
                        <View style={styles.resultsWrapper}>
                            {mapList()}
                        </View>
                    )}

                {/* Show Loading Data while awaiting Fetch. #FIXME: Use spinner or dummy shapes */}
                {!this.state.loaded && (
                    <Text>Loading Data</Text>
                )}
                {!this.state.featureLoaded && (
                    <Text>Loading Data</Text>
                )}

                {/* If featured recipe is already loaded */}
                {this.state.featureLoaded && (
                    <View>
                        <Text style={styles.headline}>Featured Recipe</Text>
                        <View style={styles.cardWrapper}>
                        <TouchableOpacity
                            onPress={
                                () => this.props.navigation.navigate("Recipe", {
                                    recipeID: this.state.feature.meals[0].idMeal,
                                    recipeName: this.state.feature.meals[0].strMeal
                                }
                                )
                            }
                        >
                            <View style={styles.card}>
                                <View style={styles.imageWrapper}>
                                    <Image  
                                        source={{uri:this.state.feature.meals[0].strMealThumb}}
                                        style={{width: 298, height: 250,borderTopLeftRadius: 20, borderTopRightRadius: 20}}
                                    />
                                </View>
                                <View style={styles.titleWrapper}>
                                    <Text
                                        style={styles.title}
                                    >{this.state.feature.meals[0].strMeal}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                            
                        </View>
                    </View>
                )}

                {/* If main category content is already loaded */}
                {this.state.loaded && (
                    <View style={styles.cardWrapper}>
                        <View style={{marginBottom: 10}}>
                            <Text style={styles.headline}>By Category</Text>
                            <Picker
                                selectedValue={this.state.category}
                                mode="dialog"
                                style={{width: 150, height: 20,}}
                                onValueChange={(itemValue, itemIndex) => this.getData(itemValue)}
                            >
                                <Picker.Item label="Beef" value="beef" />
                                <Picker.Item label="Chicken" value="chicken" />
                                <Picker.Item label="Dessert" value="dessert" />
                                <Picker.Item label="Lamb" value="lamb" />
                                <Picker.Item label="Miscellaneous" value="miscellaneous" />
                                <Picker.Item label="Pasta" value="pasta" />
                                <Picker.Item label="Pork" value="pork" />
                                <Picker.Item label="Seafood" value="seafood" />
                                <Picker.Item label="Sides" value="side" />
                                <Picker.Item label="Starters" value="starter" />
                                <Picker.Item label="Vegan" value="vegan" />
                                <Picker.Item label="Vegetarian" value="vegetarian" />
                                <Picker.Item label="Breakfast" value="breakfast" />
                                <Picker.Item label="Goat" value="goat" />
                            </Picker>
                        </View>
                        {/* Flatlist to scroll horizontally. Snaps at the width of the screen */}
                        <FlatList
                            data={this.state.data.meals}
                            renderItem = {renderItem}
                            keyExtractor={(item => item.idMeal)} 
                            horizontal
                            snapToAlignment={"start"}
                            snapToInterval={windowWidth}
                            decelerationRate={"fast"}
                            pagingEnabled
                            refreshing
                        />

                    </View>
                )}
            </ScrollView>
    )
  }
}

// Set up the stack navigator
const Stack = createStackNavigator();

/* Set up ReciepView Stack. Two screens, Images, which is the main app page and Recipe 
    which is a detail view.  
*/
class RecipeView extends Component {
    render() {
        return (
                <Stack.Navigator 
                    initialRouteName="Images"
                    headerMode= 'screen'
                    // remove shadow from under the header
                    screenOptions= {{
                        headerStyle: {elevation: 0}
                    }}
                >
                    <Stack.Screen
                        name="Images"
                        component={RecipeImages}
                        options={{
                            title: 'The Meal DB Recipes',
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

export default RecipeView;


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

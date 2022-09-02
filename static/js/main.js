import gameData from "./games.js";
import pokemonData from "./pokemon.js";
import dexData from "./dexes.js";
import typeData from "./types.js";
import versionData from "./versions.js";

const capitalize = str => str.charAt( 0 ).toUpperCase() + str.slice( 1 );
const getCurrentUrl = () => {
    const url = window.location.href;
    const i = url.indexOf( window.location.hash ) || url.length;
    return url.substr( 0, i );
};
const getScriptParent = () => {
    var src = document.querySelector( "script[type='module']" ).getAttribute( "src" );
    return src.substring( 0, src.lastIndexOf( "/" ) + 1 );
};
const normalize = str => str.toLowerCase().normalize( "NFD" ).replace( /\p{Diacritic}/gu, "" );
const random = ub => Math.random() * ub | 0;
const toRoman = num => {
    const vals = [ 10, 9, 5, 4, 1 ];
    var roman = "";
    [ "X", "IX", "V", "IV", "I" ].forEach( ( sym, i ) => {
        while ( num >= vals[ i ] ) {
            num -= vals[ i ];
            roman += sym;
        }
    });
    return roman;
};
const sortIds = ( a, b ) => a[ 0 ] - b[ 0 ] || a[ 1 ] - b[ 1 ];

var currentGame;
var currentVersions;

const JS_PATH = getScriptParent();
const IMG_PATH = JS_PATH + "../img/";

window.onload = buildPage;
window.onscroll  = hideHead;

function buildPage() {
    const main = document.getElementById( "team-planner" );
    var slugs;
    [ currentGame, currentVersions, slugs ] = parseUrl();
    if ( !currentGame ) {
        // Redirect to game select if already in planner
        if ( window.location.pathname.split( "/" ).includes( "plan" ) ) {
            window.location.href = "../";
            return;
        }
        populateGameList( main.firstElementChild );
        return;
    }
    completeTypeData();
    completePokemonData();
    populateTeam( main.firstElementChild );
    populateDexes( main.lastElementChild );
    populateFilters();
    slugs.forEach( slug => populateTeamSlot( slug ) );
}

function hideHead() {
    const head = document.getElementById( "head" );
    const header = document.querySelector( "header" );
    const table = document.querySelector( ".table" );
    if ( document.documentElement.scrollTop > header.offsetHeight && table.classList.contains( "hidden" ) ) {
        head.classList.add( "head--sticky" );
        header.classList.add( "hidden" );
    } else {
        head.classList.remove( "head--sticky" );
        header.classList.remove( "hidden" );
    }
}

//#region Game List

const GAME_PATH = IMG_PATH + "game/";
const GAME_TEXT = "Welcome! Select a game and start planning your Pokémon team!";

/**
 * Populate the list of games with the available planners.
 * @param {HTMLElement} container
 */
function populateGameList( container ) {
    const section = document.createElement( "section" );
    const h2 = document.createElement( "h2" );
    const p = document.createElement( "p" );
    const ol = document.createElement( "ol" );

    container.append( section );
    section.append( h2, p, ol );
    section.id = "games";
    h2.innerHTML = "Games";
    p.innerHTML = GAME_TEXT;
    ol.classList.add( "list" );

    const games = Object.entries( gameData );
    games.forEach( tup => {
        const [ slug, game ] = tup;
        const name = getGameName( game );
        const li = document.createElement( "li" );
        const a = document.createElement( "a" );
        const img = document.createElement( "img" );
        const url = (game.disabled ? "#" : JS_PATH + "../../plan/#" + slug);

        ol.append( li );
        li.append( a );
        a.append( img );

        li.classList.add( "game", slug );
        a.setAttribute( "title", name );
        a.setAttribute( "href", url );
        img.setAttribute( "alt", name );
        img.setAttribute( "src", GAME_PATH + slug + ".png" );

        if ( game.disabled ) li.classList.add( "disabled" );
    });
}

/**
 * Returns formatted name of given game.
 * @param {Object} game
 * @returns {string}
 */
function getGameName( game ) {
    return game.name || game.versions.map( ver => "Pokémon " + ver.name ).join( " and " );
}


/**
 * Returns the type chart corresponding to the current generation.
 * @returns {Object}
 */
function getCurrentTypeData() {
    const currentGeneration = gameData[ currentGame ].gen;
    return typeData.filter(
        data => data.generation <= currentGeneration
    )[ 0 ].type_data;
}

//#endregion
//#region Team Slot

const BASE_IMG = IMG_PATH + "pokemon/";
const UNKNOWN_IMG = BASE_IMG + "0000_000_uk_n.png";
const POKEMON_INFO = ["name", "form", "type", "type"];

/**
 * Populates the page with empty team slots.
 * @param {HTMLElement} container
 */
function populateTeam( container ) {
    const div = document.createElement( "div" );
    div.classList.add( "wrap" );

    const section = document.createElement( "section" );
    section.id = "team";

    const h2 = document.createElement( "h2" );
    h2.innerHTML = "Your Team";

    const ul = document.createElement( "ul" );
    ul.id = "slots"
    ul.classList.add( "list", "list-pokemon" );

    container.append( div );
    div.append( section );
    section.append( h2, ul );

    var li = document.createElement( "li" );
    li.classList.add( "empty" );
    li.dataset.slug = "";
    li.dataset.type = "";
    li.addEventListener( "click", clearTeamSlot );

    var wrap = document.createElement( "div" );
    wrap.classList.add( "wrap" );
    var fig = document.createElement( "figure" );
    var img = document.createElement( "img" );
    img.setAttribute( "src", UNKNOWN_IMG );
    var info = document.createElement( "div" );
    info.classList.add( "info" );

    ul.append( li );
    li.append( wrap, info );
    wrap.append( fig );
    fig.append( img );

    for ( let i = 0 ; i < 4 ; i++ ) {
        const span = document.createElement( "span" );
        span.classList.add( POKEMON_INFO[ i ] );
        if ( POKEMON_INFO[ i ] === "name" ) span.innerHTML = "???";
        info.append( span );
    }

    for ( let i = 0 ; i < 5 ; i++ ) {
        const clone = li.cloneNode( true )
        clone.addEventListener( "click", clearTeamSlot );
        ul.append( clone );
    }

    var buttonContainer = document.createElement( "div" );
    buttonContainer.classList.add( "button" );
    section.append( buttonContainer );

    // Create button to randomize team
    var button = document.createElement( "button" );
    button.id = "randomize";
    button.innerHTML = "Randomize Team";
    button.classList.add( "button" );
    button.addEventListener( "click", randomizeTeam );
    buttonContainer.append( button );

    // Create analysis table
    const table = document.createElement( "div" );
    table.classList.add( "table", "hidden" );

    // Create button to hide/show team analysis
    button = document.createElement( "button" );
    button.id = "analysis";
    button.innerHTML = "Show Team Analysis";
    button.classList.add( "button" );
    button.addEventListener( "click", () => {
        if ( table.classList.contains( "hidden" ) ) {
            button.innerHTML = "Hide Team Analysis";
            table.classList.remove( "hidden" );
        } else {
            button.innerHTML = "Show Team Analysis";
            table.classList.add( "hidden" );
        }
    });
    section.append( table );
    buttonContainer.append( button );

    createAnalysisTable( table );
}

/**
 * Adds a Pokémon to the current team.
 * @param {Event|string} event_or_slug
 */
function populateTeamSlot( event_or_slug ) {
    const slug = ( typeof event_or_slug === "string" )
        ? event_or_slug
        : event_or_slug.currentTarget.parentNode.dataset.slug;

    // Validate Pokémon exists in database
    if ( !slug in pokemonData ) {
        return;
    }

    // Validate Pokémon is not duplicated
    const slugs = Array.from( document.querySelectorAll( "#slots li:not(.empty)" ) ).map( li => li.dataset.slug );
    if ( slugs.includes( slug ) ) {
        return;
    }

    // Empty a team slot if team is full
    const slot = document.querySelector( "#slots li.empty" );
    if ( slot == null ) {
        document.querySelector( "#slots li" ).click();
        return populateTeamSlot( slug );
    }

    var gmax = slug.endsWith( "-gmax" );

    const pokemon = pokemonData[ gmax ? slug.substring( 0, slug.length - 5 ) : slug ];
    const type = getPokemonType( pokemon );pokemon.type
    slot.dataset.type = type;
    slot.classList.remove( "empty" );
    slot.dataset.slug = slug;

    const name = ( gmax ? "Gigantamax " : "" ) + pokemon.name;
    const img = slot.querySelector( "img" );
    img.setAttribute( "src", getPokemonRenderUrl( pokemon, gmax ) );
    img.setAttribute( "alt", name );

    slot.querySelector( ".name" ).innerHTML = name;

    if ( pokemon.form ) {
        slot.querySelector( ".form" ).innerHTML = pokemon.form;
    }

    var span = slot.querySelectorAll( ".type" );
    span.forEach( ( span, i ) => {
        span.classList.add( type[ i ] );
        span.innerHTML = ( type[ i ] ) ? capitalize( type[ i ] ) : "";
    });


    const li = document.querySelector( ".pokedex li[data-slug='" + slug + "']" );
    if ( li ) {
        li.classList.add( "picked" );
        toggleEmptyDex();
    }

    updateAnalysisTable();
    updateTeamHash();
}

/**
 * Removes a Pokémon from the current party.
 * @param {Event|string} event_or_slug
 */
 function clearTeamSlot( event_or_slug ) {
    var slot = ( typeof event_or_slug === "string" )
        ? document.querySelector( "#slots li[data-slug='" + slug + "']" )
        : event_or_slug.currentTarget;

    const slug = slot.dataset.slug;
    // Empty data
    slot.classList.add( "empty" );
    slot.dataset.slug = "";
    slot.dataset.type = "";

    const img = slot.querySelector( "img" );
    img.setAttribute( "src", UNKNOWN_IMG );
    img.setAttribute( "alt", "" );

    slot.querySelector( ".name" ).innerHTML = "???";
    slot.querySelector( ".form" ).innerHTML = "";
    slot.querySelectorAll( ".type" ).forEach( span => {
        span.setAttribute( "class", "type" );
        span.innerHTML = "";
    });

    // Move to last place
    slot.parentNode.append( slot );

    const li = document.querySelector( ".pokedex li[data-slug='" + slug + "']" );
    if ( li ) {
        li.classList.remove( "picked" );
        toggleEmptyDex();
    }

    updateAnalysisTable();
    updateTeamHash();
}

/**
 * Returns the URL corresponding to a Pokémon's Pokémon HOME render.
 * @param {Object} pokemon
 * @param {boolean} gmax whether to retrieve the Gigantamax render
 * @returns {string} url
 */
function getPokemonRenderUrl( pokemon, gmax = false ) {
    return BASE_IMG + [
        String( pokemon.id ).padStart( 4, "0" ),
        String( pokemon.form_id ).padStart( 3, "0" ),
        ( gmax && pokemon.gender.length > 1 ) ? "mf" : pokemon.gender[ 0 ],
        gmax ? "g" : "n"
    ].join( "_" ) + ".png";
}

/**
 * Randomly selects and adds up to 6 Pokémon to the current team.
 */
function randomizeTeam() {
    // Clear search bar
    const search = document.getElementById( "search-bar" );
    if ( search.value.length > 0 ) {
        search.value = "";
        filterDex();
    }
    // Clear current team
    document.querySelectorAll( "#slots li:not(.empty)" ).forEach( li => li.click() );
    // List Pokémon that can be added to the team
    const slugs = Array.from(
        document.querySelectorAll( ".pokedex li:not(.filtered):not(.picked)" )
    ).map( li => li.dataset.slug );
    // If there are Pokémon available, add up to 6 random picks
    if ( slugs.length > 0 ) {
        const teamSize = Math.min( 6, slugs.length );
        for ( let i = 0; i < teamSize; i++ ) {
            const idx = random( slugs.length );
            const slug = slugs[ idx ];
            populateTeamSlot( slug );
            // Remove Pokémon from options
            slugs.splice( idx, 1 );
        }
    }
}

//#endregion
//#region Dex

/**
 * Populates the "#pokedexes" ol element with the Pokédexes available in the
 * selected game.
 * @param {HTMLElement} container
 * @param {Object} game
    <section id="options">
        <h2>Your Options</h2>
        <div id="filters"></div>
        <ol id="pokedexes"></ol>
    </section>
 */
function populateDexes( container ) {
    const game = gameData[ currentGame ];

    const h1 = document.querySelector( "h1 .name" );
    const section = document.createElement( "section" );
    const h2 = document.createElement( "h2" );
    const div = document.createElement( "div" );
    const ol = document.createElement( "ol" );

    h1.innerHTML = getGameName( game );
    h1.classList.add( "game", currentGame );
    h1.style.background = "url('" + GAME_PATH + currentGame + ".png')";
    container.prepend( section );
    section.append( h2, div, ol );
    section.id = "options";
    h2.innerHTML = "Your Options";
    div.id = "filters";
    ol.id = "pokedexes";
    ol.classList.add( "list" );

    game.dex_slugs.forEach( ( slug, i ) => {
        let li = document.createElement( "li" );
        let heading = document.createElement( "h3" );
        let pokedex = document.createElement( "ol" );

        ol.append( li );
        li.append( heading );
        heading.innerHTML = dexData[ slug ].name;
        li.append( pokedex );
        pokedex.id = slug;
        pokedex.classList.add( "list", "list-pokemon", "pokedex" );

        populateDex( pokedex, dexData[ slug ] );
    });
}

/**
 * Populates the "#pokedex" ol element with selectable entries that can be
 * added to a Pokémon team.
 * @param {HTMLOListElement} ol entry container
 * @param {Object} dexEntry
 */
function populateDex( ol, dexEntry ) {
    const order = Object.keys( dexEntry.order ).sort( ( a, b ) => a - b );
    const entries = Object.entries( pokemonData );
    order.forEach( num => {
        const ids = dexEntry.order[ num ].sort( sortIds );
        ids.forEach( id => {
            const [ base_id, form_id] = id;
            const [ slug, pokemon ] = entries.find(
                tup => tup[ 1 ].id === base_id && tup[ 1 ].form_id === form_id
            );
            createPokemonEntry( slug, pokemon ).forEach( li => {
                ol.append( li );
            })
        });
    });
}

/**
 * Creates a li element containing the entry of a Pokémon.
 * @param {string} slug
 * @param {Object} pokemon
 * @returns {HTMLLIElement}
 */
function createPokemonEntry( slug, pokemon ) {
    const img = document.createElement( "img" );
    const button = document.createElement( "button" );
    const li = document.createElement( "li" );

    li.append( button );
    button.append( img );
    button.addEventListener( "click", populateTeamSlot );

    li.dataset.slug = slug;
    li.dataset.id = pokemon.id;
    li.dataset.formId = pokemon.form_id;
    li.setAttribute( "title", pokemon.name );

    img.setAttribute( "alt", pokemon.name );
    img.setAttribute( "src", getPokemonRenderUrl( pokemon ) );
    img.setAttribute( "loading", "lazy" );

    // If Pokémon can Gigantamax, duplicate its entry
    if ( gameData[ currentGame ].gmax && pokemon.gmax ) {
        const clone = li.cloneNode( true );
        clone.dataset.slug = slug + "-gmax";
        clone.querySelector( "button" ).addEventListener( "click", populateTeamSlot );
        clone.querySelector( "img" ).setAttribute( "src", getPokemonRenderUrl( pokemon, true ) );
        return [ li, clone ];
    }
    return [ li ];
}

/**
 * Completes each Pokémon's entry with additional data (e.g., type effectiveness data).
 */
function completePokemonData() {
    const pokemonEntries = Object.entries( pokemonData );
    const typeData = getCurrentTypeData();
    Object.values( pokemonData ).filter(
        pokemon => isInDex( pokemon.id, pokemon.form_id )
    ).forEach( pokemon => {
        const type = getPokemonType( pokemon );
        const type1 = type[ 0 ];
        const type2 = type.length === 1
            ? null
            : type[ 1 ];
        if ( type2 == null ) {
            // If there is no secondary type, use data from primary type
            pokemon.weaknesses = typeData[ type1 ].weak2 || [];
            pokemon.immunities = typeData[ type1 ].immune2 || [];
            pokemon.resistances = typeData[ type1 ].resists || [];
            pokemon.coverage = typeData[ type1 ].weakens || [];
        } else {
            // Union of immunities
            pokemon.immunities = union( typeData[ type1 ].immune2, typeData[ type2 ].immune2 );
            // Union of differences (resists minus weakneses)
            pokemon.resistances = union(
                difference( typeData[ type1 ].resists, typeData[ type2 ].weak2 ),
                difference( typeData[ type2 ].resists, typeData[ type1 ].weak2 )
            );
            // Union of differences (weaknesses minus resists) minus immunities
            pokemon.weaknesses = difference(
                union(
                    difference( typeData[ type1 ].weak2, typeData[ type2 ].resists ),
                    difference( typeData[ type2 ].weak2, typeData[ type1 ].resists )
                ),
                pokemon.immunities
            );
            // Union of weakened types
            pokemon.coverage = union( typeData[ type1 ].weakens, typeData[ type2 ].weakens );
        }
        // Check if Pokémon evolves, if it does set fully-evolved to false
        pokemon.fully_evolved = true
        if ( pokemon.evolves ) {
            pokemon.fully_evolved = !pokemon.evolves.some( id => {
                const [ base_id, form_id ] = id;
                // Check if evolution is available in dex (some evolutions may not be available in certain dexes)
                return isInDex( base_id, form_id );
            });
        }
    });
    Object.entries( versionData ).forEach( tup => {
        const [ version, ids ] = tup;
        ids.forEach( id => {
            const [ base_id, form_id ] = id;
            const [ slug, pokemon ] = pokemonEntries.find(
                tup => tup[ 1 ].id === base_id && tup[ 1 ].form_id === form_id
            );
            if ( pokemon.version == null ) {
                pokemon.version = [];
            }
            pokemon.version.push( version );
        });
    });
}

/**
 * Checks whether given Pokémon ID is present in current dex.
 * @param {Number} base_id 
 * @param {Number} form_id 
 * @returns {boolean}
 */
function isInDex( base_id, form_id ) {
    var result = false;
    gameData[ currentGame ].dex_slugs.forEach( slug => {
        Object.values( dexData[ slug ].order ).flat().forEach( id => {
            if ( id[ 0 ] === base_id && id[ 1 ] === form_id ) {
                result = true;
                return;
            }
        });
        if ( result ) {
            return;
        }
    });
    return result;
}

/**
 * Returns the type of the given Pokémon.
 * @param {Object} pokemon 
 * @returns {string[]}
 */
function getPokemonType( pokemon ) {
    if ( pokemon.past_type == null
        || ( gameData[ currentGame ].gen >= pokemon.past_type.generation ) ) {
        return pokemon.type;
    }
    return pokemon.past_type.pokemon_type;
}

//#endregion
//#region Filters

const COLORS = [
    "red", "blue", "yellow", "green", "black",
    "brown", "purple", "gray", "white", "pink"
];

/**
 * Populate the drop-down menus with the available filters.
 */
function populateFilters() {
    const filters = document.getElementById( "filters" );
    const types = Object.keys( getCurrentTypeData() );
    // Type
    var type_dropdown = createFilter( filters, "type", "Type" );
    // Evolution
    var dropdown = createFilter( filters, "evolution", "Evolution" );
    dropdown.append( createCheckbox( "evolution", "Not Fully Evolved", "nfe" ) );
    dropdown.append( createCheckbox( "evolution", "Fully Evolved", "fe" ) );
    if ( gameData[ currentGame ].mega ) dropdown.append(
        createCheckbox( "evolution", "Mega Evolved", "mega" )
    );
    // Generation
    dropdown = createFilter( filters, "gen", "Generation" );
    for ( let i = 1; i <= gameData[ currentGame ].gen; i++ ) {
        dropdown.append( createCheckbox( "gen", "Generation " + toRoman( i ), i ) );
    }
    // Version
    const disabled = currentVersions.length === 0;
    dropdown = createFilter( filters, "version", "Version", false, false, disabled );
    if ( !disabled ) {
        dropdown.append( createCheckbox( "version", "Both Versions", "both" ) );
        gameData[ currentGame ].versions.forEach( version => {
            dropdown.append( createCheckbox( "version", version.name, version.slug ) );
        });
    }
    // Exclude Type
    var dropdown = createFilter( filters, "exclude-type", "Exclude Type", true, false );
    types.forEach( value => {
        type_dropdown.append( createCheckbox( "type", capitalize( value ), value ) );
        dropdown.append( createCheckbox( "exclude-type", capitalize( value ), value, false ) );
    });
    // Category
    dropdown = createFilter( filters, "tag", "Tag" );
    dropdown.append( createCheckbox( "tag", "Non-Legendary", "nonlegendary" ) );
    dropdown.append( createCheckbox( "tag", "Sub-Legendary", "sublegendary" ) );
    dropdown.append( createCheckbox( "tag", "Legendary", "legendary" ) );
    dropdown.append( createCheckbox( "tag", "Mythical", "mythical" ) );
    if ( gameData[ currentGame ].gmax ) dropdown.append(
        createCheckbox( "tag", "Gigantamax", "gmax" )
    );
    // Color
    dropdown = createFilter( filters, "color", "Color" );
    COLORS.forEach( value => {
        dropdown.append( createCheckbox( "color", capitalize( value ), value ) );
    })
    // Search
    createSearchBar( filters );
}

/**
 * Creates a "div.filter," which contains a label and a dropdown menu.
 * @param {HTMLElement} container
 * @param {string} type
 * @param {string} name
 * @param {boolean} inclSelectAll
 * @returns {HTMLOListElement} dropdown
 */
function createFilter( container, type, name, inclSelectAll = true, selectAll = true, disabled = false ) {
    const dropdown = document.createElement( "ol" );
    dropdown.classList.add( "dropdown-menu" );
    if ( inclSelectAll ) dropdown.append( createCheckbox( type, "Select All", "all", selectAll ) );

    const div = document.createElement( "div" );
    div.dataset.type = type;
    div.classList.add( "filter" );

    const label = document.createElement( "label" );
    label.setAttribute( "for", type + "-filter" );
    label.innerHTML = name;

    const button = document.createElement( "button" );
    button.id = type + "-filter";
    if ( !disabled ) {
        button.innerHTML = selectAll ? "All Selected" : "None Selected";
        button.addEventListener( "click", expandDropdown );        
    } else {
        button.innerHTML = "N/A";
        div.classList.add( "disabled" );
    }

    container.append( div );
    div.append( label, button, dropdown );

    return dropdown;
}

/**
 * Creates a search bar to filter Pokémon by name.
 * @param {HTMLElement} container 
 * @returns {HTMLInputElement}
 */
function createSearchBar( container ) {
    const div = document.createElement( "div" );
    div.dataset.type = "name";
    div.classList.add( "filter" );

    const label = document.createElement( "label" );
    label.setAttribute( "for", "search-bar" );
    label.innerHTML = "Search";

    const input = document.createElement( "input" );
    input.id = "search-bar";
    input.setAttribute( "type", "search" );
    input.setAttribute( "placeholder", "by Pokémon name" );
    input.addEventListener( "input", filterDex );

    container.append( div );
    div.append( label, input );

    return input
}

/**
 * Expand the clicked drop-down menu.
 * @param {Event} event
 */
function expandDropdown( event ) {
    const parent = event.currentTarget.parentNode;
    const active = parent.classList.contains( "active" );
    // Collapse all dropdown menus
    document.querySelectorAll( ".filter" ).forEach( (filter) => {
        filter.classList.remove( "active" );
    });
    // Expand/collapse dropdown menu
    if ( active ) {
        parent.classList.remove( "active" );
    } else {
        parent.classList.add( "active" );
        document.addEventListener( "click", collapseDropdown );
    }
}

/**
 * Collapse the selected drop-down menu.
 * @param {Event} event
 */
function collapseDropdown( event ) {
    const target = event.target;
    // Detect click outside dropdown menu
    if ( !target.closest( ".filter.active :where(button, .dropdown-menu)" ) ) {
        document.querySelectorAll( ".filter.active" ).forEach( div => div.classList.remove( "active" ) );
        document.removeEventListener( "click", collapseDropdown );
    }
}

/**
 * Creates a checkbox option.
 * @param {string} type
 * @param {string} name
 * @param {string} value
 * @param {boolean} checked
 * @param {boolean} isRadio
 * @returns {HTMLLIElement}
 */
function createCheckbox( type, name, value, checked = true, isRadio = false ) {
    const li = document.createElement( "li" );
    if ( checked ) li.classList.add( "active" );

    const input = document.createElement( "input" );
    input.id = [ "filter", type, value ].join( "-" );
    input.setAttribute( "name", type );
    input.setAttribute( "value", value );
    input.setAttribute( "type", isRadio ? "radio" : "checkbox" );
    if ( checked ) input.setAttribute( "checked", "" );
    input.addEventListener( "change", changeCheckbox );

    const label = document.createElement( "label" );
    label.setAttribute( "for", input.id );
    label.innerHTML = name;

    li.append( label, input );
    return li;
}

/**
 * Handles a change in a filter.
 * @param {Event} event
 */
function changeCheckbox( event ) {
    const target = event.currentTarget;
    const name = target.getAttribute( "name" );
    const selector = "input[name='" + name + "']";
    // If target is checked, add "active" class
    if ( target.checked ) {
        // If target was "all", add "active" class to all options
        if ( target.value === "all" ) {
            document.querySelectorAll( selector ).forEach( input => {
                input.checked = true;
                input.parentNode.classList.add( "active" );
            });
        } else {
            target.parentNode.classList.add( "active" );
        }
    // If target was unchecked, remove "active" class
    } else {
        // If target was "all", remove "active" class from all options
        if ( target.value === "all" ) {
            document.querySelectorAll( selector ).forEach( (input) => {
                input.checked = false;
                input.parentNode.classList.remove( "active" );
            });
        } else {
            target.parentNode.classList.remove( "active" );
            const all = document.querySelector( selector + "[value='all']" );
            if ( all ) {
                all.checked = false;
                all.parentNode.classList.remove( "active" );
            }
        }
    }
    // Update count in button
    const button = document.querySelector( "#" + name + "-filter" );
    const exceptAllSelector = selector + ":not([value='all'])";
    const allOptions = document.querySelectorAll( exceptAllSelector );
    const checkedOptions = document.querySelectorAll( exceptAllSelector + ":checked" );
    if ( allOptions.length === checkedOptions.length ) {
        const all = document.querySelector( selector + "[value='all']" );
        if ( all ) {
            all.checked = true;
            all.parentNode.classList.add( "active" );
        }
        button.innerHTML = "All Selected";
    } else {
        switch ( checkedOptions.length ) {
            case 0:
                button.innerHTML = "None Selected";
                break;
            case 1:
                button.innerHTML = "1 Selected";
                break;
            default:
                button.innerHTML = String(checkedOptions.length) + " Selected";
        }
    }
    filterDex();
}

/**
 * Returns the filters that have been selected.
 * @param {string} type
 * @returns
 */
function getSelectedFilters( type ) {
    const selection = Array.from( document.querySelectorAll(
        "#" + type + "-filter + .dropdown-menu .active input"
    ) );
    return selection.map( input => input.value );
}

/**
 * Filters the Pokémon list based on the selected filters.
 */
function filterDex() {
    const [ gens, tags, types, exclTypes, evolutions, versions, colors ] = [
        getSelectedFilters( "gen" ), getSelectedFilters( "tag" ),
        getSelectedFilters( "type" ), getSelectedFilters( "exclude-type" ),
        getSelectedFilters( "evolution" ), getSelectedFilters( "version" ),
        getSelectedFilters( "color" )
    ];
    const query = normalize( document.getElementById( "search-bar" ).value );
    document.querySelectorAll( ".pokedex li" ).forEach( li => {
        var slug = li.dataset.slug;
        const gmax = slug.endsWith( "-gmax" );
        if ( gmax ) slug = slug.substring( 0, slug.length - 5 );
        const pokemon = pokemonData[ slug ];
        // Check if Pokémon
        const matchesQuery = query.length === 0 || slug.indexOf( query ) >= 0;
        if ( matchesQuery ) {
            // Check if Pokémon belongs to any selected gen
            const isSelectedGen = (
                gens.length > 0
                && (
                    gens.includes( "all" )
                    || ( gmax && gens.includes( "8" ) )
                    || ( !gmax && gens.includes( pokemon.gen.toString() ) )
                )
            );
            if ( isSelectedGen ) {
                // Check if Pokémon has any selected type
                const type = getPokemonType( pokemon );
                const hasType = (
                    types.length > 0 
                    && (
                        types.includes( "all" )
                        || types.includes( type[ 0 ] )
                        || ( type[ 1 ] && types.includes( type[ 1 ] ) )
                    )
                );
                if ( hasType ) {
                    // Check if Pokémon has any excluded type
                    const hasExclType = (
                        exclTypes.length > 0 
                        && (
                            exclTypes.includes( "all" )
                            || exclTypes.includes( type[ 0 ] )
                            || ( type[ 1 ] && exclTypes.includes( type[ 1 ] ) )
                        )
                    );
                    if ( !hasExclType ) {
                        // Check if Pokémon has any selected evolutionary stage
                        const hasSelectedEvolution = (
                            evolutions.length > 0 
                            && (
                                evolutions.includes( "all" )
                                || ( evolutions.includes( "nfe" ) && !pokemon.fully_evolved )
                                || ( evolutions.includes( "fe" ) && pokemon.fully_evolved && !pokemon.mega )
                                || ( evolutions.includes( "mega" ) && pokemon.mega )
                            )
                        );
                        if ( hasSelectedEvolution ) {
                            // Check if Pokémon has version
                            const isSelectedVersion = (
                                currentVersions.length === 0
                                || (
                                    versions.length > 0
                                    && (
                                        versions.includes( "all" )
                                        || (
                                            versions.includes( "both" )
                                            && (
                                                pokemon.version.length === 0
                                                || (
                                                    !pokemon.version.includes( currentVersions[ 0 ] )
                                                    && !pokemon.version.includes( currentVersions[ 1 ] )
                                                )
                                            )
                                        )
                                        || (
                                            pokemon.version.length > 0
                                            && (
                                                (
                                                    versions.includes( currentVersions[ 0 ] )
                                                    && pokemon.version.includes( currentVersions[ 0 ] )
                                                )
                                                || (
                                                    versions.includes( currentVersions[ 1 ] )
                                                    && pokemon.version.includes( currentVersions[ 1 ] )
                                                )
                                            )
                                        )
                                    )
                                )
                            );
                            if ( isSelectedVersion ) {
                                // Check if Pokémon has any tag
                                const hasSelectedTag = (
                                    tags.length > 0
                                    && (
                                        tags.includes( "all" ) || (
                                            gmax
                                            ? tags.includes( "gmax" )
                                            : (
                                                (
                                                    tags.includes( "nonlegendary" )
                                                    && !pokemon.sublegendary
                                                    && !pokemon.legendary
                                                    && !pokemon.mythical
                                                )
                                                || tags.filter( tag => tag !== "gmax" ).some( tag => tag in pokemon )
                                            )
                                        )
                                    )
                                );
                                if ( hasSelectedTag ) {
                                    const isSelectedColor = (
                                        colors.length > 0
                                        && (
                                            colors.includes( "all" )
                                            || colors.includes( pokemon.color )
                                        )
                                    )
                                    if ( isSelectedColor ) {
                                        li.classList.remove( "filtered" );
                                        return;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        li.classList.add( "filtered" );
    });
    toggleEmptyDex();
}

/**
 * Hides/shows any Pokédex that is empty (i.e., all Pokémon picked or filtered).
 */
function toggleEmptyDex() {
    document.querySelectorAll( ".pokedex" ).forEach( ol => {
        if ( ol.children.length === ol.querySelectorAll( ":where(.filtered, .picked)" ).length ) {
            ol.parentNode.classList.add( "hidden" );
        } else {
            ol.parentNode.classList.remove( "hidden" );
        }
    });
}

//#endregion
//#region Team Analysis

const TYPE_PATH = IMG_PATH + "type/";
const TABLE_INDEX = [ "", "weaknesses", "immunities", "resistances", "coverage" ];

/**
 * Mutates the type data, to include what types each type is weakened by.
 */
function completeTypeData() {
    const typeData = getCurrentTypeData();
    Object.keys( typeData ).forEach( attackingType => {
        typeData[ attackingType ].weakens = [];
        Object.keys( typeData ).forEach( defendingType => {
            if ( typeData[ defendingType ].weak2 
                && typeData[ defendingType ].weak2.includes( attackingType ) ) {
                typeData[ attackingType ].weakens.push( defendingType );
            }
        });
    });
}

/**
 * Creates and returns a table with columns for each given type and 4 rows:
 * weaknesses, immunities, resistances, and coverage.
 * @param {Array} typeSlugs 
 * @returns {HTMLElement} table
 */
function createTable( typeSlugs ) {
    const table = document.createElement( "table" );
    const colgroup = document.createElement( "colgroup" );
    const thead = document.createElement( "thead" );
    const tbody = document.createElement( "tbody" );
    table.append( colgroup, thead, tbody );
    TABLE_INDEX.forEach( row => {
        const isHeader = row === "";
        const tr = document.createElement( "tr" );
        const td = document.createElement( "th" );
        tr.append( td );
        if ( isHeader ) {
            colgroup.append( document.createElement( "col" ) );
            thead.append( tr );
        } else {
            tbody.append( tr );
            tr.classList.add( row );
            td.innerHTML = capitalize( row );
        }
        typeSlugs.forEach( ( slug, j ) => {
            const td = document.createElement( isHeader ? "th" : "td" );
            if ( isHeader ) {
                colgroup.append( document.createElement( "col" ) );
                const img = document.createElement( "img" );
                img.setAttribute( "src", TYPE_PATH + slug + ".png" );
                img.setAttribute( "alt", capitalize( slug ) );
                td.append( img );
            } else {
                td.innerHTML = "0";
                td.addEventListener( "mouseover", () => {
                    tr.classList.add( "hover" );
                    colgroup.children[ j + 1 ].classList.add( "hover" );
                });
                td.addEventListener( "mouseout", () => {
                    tr.classList.remove( "hover" );
                    colgroup.children[ j + 1 ].classList.remove( "hover" );
                });
            }
            
            tr.append( td );
            td.classList.add( slug );
        });
    });
    return table;
}

/**
 * Creates a split table for the current team's battle properties.
 * @param {HTMLElement} container 
 */
function createAnalysisTable( container ) {
    // Split table vertically
    const types = Object.keys( getCurrentTypeData() );
    const typesPerTable = types.length / 2;
    container.append(
        createTable( types.slice( 0, typesPerTable ) ),
        createTable( types.slice( typesPerTable ) )
    );
}

/**
 * 
 */
function updateAnalysisTable() {
    // Fetch current Pokémon slugs
    const slots = document.querySelectorAll( "#slots li:not(.empty)" );
    const slugs = Array.from( slots ).map( li => {
        const slug = li.dataset.slug;
        if ( slug.endsWith( "-gmax" ) ) {
            return slug.substring( 0, slug.length - 5 );
        }
        return slug;
    });
    // Update analysis row for each type
    TABLE_INDEX.slice( 1 ).forEach( row => {
        Object.keys( getCurrentTypeData() ).forEach( typeSlug => {
            // Start counter
            var count = 0;
            // Increase count for each matching Pokémon
            slugs.forEach( slug => {
                if ( pokemonData[ slug ][ row ].includes( typeSlug ) ) count++;
            });
            // Update HTML
            const td = document.querySelector( "tr." + row + " td." + typeSlug );
            td.innerHTML = count;
        });
    });
}

//#endregion
//#region Miscellaneous

/**
 * Reads the hash from the current URL and parses current game and Pokémon.
 * @returns {Array} array containing current game, versions, and slugs
 */
 function parseUrl() {
    // Make sure location is planner and hash exists
    if ( window.location.pathname.split( "/" ).includes( "plan" )
        && window.location.hash ) {
        let slugs = window.location.hash.substring( 1 ).split( "+" );
        // Check game is valid and not disabled
        if ( slugs[ 0 ] in gameData  ) {
            const game = slugs[ 0 ];
            if ( !gameData[ game ].disabled ) {
                const versions = gameData[ game ].versions
                    ? gameData[ game ].versions.map( ver => ver.slug )
                    : [];
                slugs = slugs.slice( 1 );  // Remove hash
                return [ game, versions, slugs ]
            }
        }
    }
    return [ null, [], [] ]
}

/**
 * Updates the URL based on the current Pokémon team.
 */
function updateTeamHash() {
    const slugs = [ currentGame ];
    document.querySelectorAll( "#slots li:not(.empty)" ).forEach( li => {
        slugs.push( li.dataset.slug );
    });
    const hash = slugs.join( "+" );
    if ( window.history.replaceState ) {
        const url = getCurrentUrl() + "#" + hash;
        window.history.replaceState( url, "", url );
    } else {
        window.location.hash = hash;
    }
}

/**
 * Returns unique elements of an array.
 * @param {Array} array
 * @returns {Array}
 */
 function set( array ) {
    var a = array.concat();
    for( let i = 0; i < a.length; i++ ) {
        for( let j = i + 1; j < a.length; j++ ) {
            if( a[ i ] === a[ j ]) a.splice( j--, 1 );
        }
    }
    return a;
}

/**
 * Returns elements in first array not present in second array.
 * @param {Array} a
 * @param {Array} b
 * @returns {Array}
 */
function difference( a, b ) {
    return a.filter( x => b.indexOf( x ) < 0 );
}

/**
 * Returns unique elements of both arrays.
 * @param {Array} a
 * @param {Array} b
 * @returns {Array}
 */
function union( a, b ) {
    return set( a.concat( b ) );
}

//#endregion

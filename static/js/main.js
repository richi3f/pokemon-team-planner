import gameData from "./games.js";
import pokemonData from "./pokemon.js";
import dexData from "./dexes.js";
import typeData from "./types.js";
import versionData from "./versions.js";

const capitalize = str => str.charAt( 0 ).toUpperCase() + str.slice( 1 );
const getCurrentUrl = () => {
    const url = window.location.href;
    const i = url.indexOf( window.location.hash ) || url.length;
    return url.substring( 0, i );
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

const AVAIL_ZA_IMAGES = [
    "victreebel-mega", "dragonite-mega", "chesnaught-mega", "delphox-mega",
    "greninja-mega", "floette-eternal", "malamar-mega", "hawlucha-mega"
];

window.onload = buildPage;

function buildPage() {
    var slugs;
    [ currentGame, currentVersions, slugs ] = parseUrl();
    if ( !currentGame ) {
        // Redirect to game select if already in planner
        if ( window.location.pathname.split( "/" ).includes( "plan" ) ) {
            window.location.href = "../";
            return;
        }
        populateGameList( document.querySelector( ".head" ) );
        return;
    }
    completeTypeData();
    completePokemonData();
    populateTeam( document.querySelector( ".head" ) );
    populateTeraPicker( document.querySelector( ".slot__toggle-container" ) );
    populateDexes( document.querySelector( ".tail" ) );
    populateFilters();
    slugs.forEach( slug => populateTeamSlot( slug ) );
    window.onscroll = shrinkHead;
}

/**
 * Shrink header when scrolling
 */
 function shrinkHead() {
    const head = document.querySelector( ".head" );
    const target = document.querySelector( ".picker__pokedexes" ).getBoundingClientRect().top;
    const analysis = document.querySelector( ".team__type-analysis" );
    const activeFilters = document.querySelectorAll( ".filter_active" );
    if (
        target < 0
        && analysis.classList.contains( "type-analysis_hidden" )
        && activeFilters.length === 0
    ) {
        head.classList.add( "head_sticky" );
    } else {
        head.classList.remove( "head_sticky" );
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

    container.querySelector( "header" ).after( section );
    section.append( h2, p, ol );
    section.classList.add( "head__game-picker" );
    h2.innerHTML = "Games";
    p.innerHTML = GAME_TEXT;
    ol.classList.add( "game-picker" );

    const games = Object.entries( gameData );
    games.forEach( tup => {
        const [ slug, game ] = tup;
        const name = getGameName( game );
        const li = document.createElement( "li" );
        const a = document.createElement( "a" );
        const img = document.createElement( "img" );
        const url = ( game.disabled ? "#" : JS_PATH + "../../plan/#" + slug );

        ol.append( li );
        li.append( a );
        a.append( img );

        li.classList.add( "game-picker__game" );
        a.classList.add( "game-picker__button" );
        a.setAttribute( "title", name );
        a.setAttribute( "href", url );
        img.classList.add( "game-picker__game-logo", "game-picker__game-logo_" + slug );
        img.setAttribute( "alt", name );
        img.setAttribute( "src", GAME_PATH + slug + ".png" );

        if ( game.disabled ) li.classList.add( "game-picker__game_disabled" );
    });
}

/**
 * Returns formatted name of given game.
 * @param {Object} game
 * @returns {string}
 */
function getGameName( game ) {
    if ( game.name == null ) {
        const versions = game.versions.map( ver => "Pokémon " + ver.name );
        if ( game.versions.length > 2 ) {
            versions[ versions.length - 1 ] = "and " + versions[ versions.length - 1 ];
            return versions.join( ", " );
        }
        return versions.join( " and " );
    }
    return game.name;
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
const SV_BASE_IMG = IMG_PATH + "sv-pokemon/";
const UNKNOWN_IMG = BASE_IMG + "0000_000_uk_n.png";
const SV_UNKNOWN_IMG = SV_BASE_IMG + "0000_000.png"

/**
 * Populates the page with empty team slots.
 * @param {HTMLElement} container
 */
function populateTeam( container ) {
    const div = document.createElement( "div" );
    div.classList.add( "head__team" );

    const section = document.createElement( "section" );
    section.classList.add( "team" );

    const h2 = document.createElement( "h2" );
    h2.innerHTML = "Your Team";
    h2.classList.add( "team__heading" );

    const ul = document.createElement( "ul" );
    ul.classList.add( "team__slots" );

    container.append( div );
    div.append( section );
    section.append( h2, ul );

    const template = document.querySelector( "#team-slot" );
    for ( let i = 0 ; i < 6 ; i++ ) {
        const clone = template.content.cloneNode( true );
        clone.querySelectorAll( ".slot__remove-button, .slot__info" ).forEach( div => {
            div.addEventListener( "click", clearTeamSlot );
            div.addEventListener( "mouseenter", ( event ) => {
                event.target.parentNode.classList.add( "slot_hover" );
            });
            div.addEventListener( "mouseleave", ( event ) => {
                event.target.parentNode.classList.remove( "slot_hover" );
            });
        });
        clone.querySelector( ".slot__toggle_female" ).addEventListener( "click", toggleGender );
        clone.querySelector( ".slot__toggle_regular" ).addEventListener( "click", toggleShiny );
        if ( gameData[ currentGame ].tera ) {
            clone.querySelector( ".slot__toggle_tera" ).addEventListener( "click", showTeraPicker );
        }
        ul.append( clone );
    }

    var buttonContainer = document.createElement( "div" );
    buttonContainer.classList.add( "team__buttons" );
    section.append( buttonContainer );

    // Create button to randomize team
    var button = document.createElement( "button" );
    button.innerHTML = "Randomize Team";
    button.classList.add( "team__button" );
    button.addEventListener( "click", randomizeTeam );
    buttonContainer.append( button );

    // Create analysis section
    const analysis = document.createElement( "div" );
    analysis.classList.add( "team__type-analysis", "type-analysis_hidden" );
    const defTallies = document.createElement( "ol" );
    const defHeading = document.createElement( "h3" );
    defHeading.innerHTML = "Team Defense";
    defHeading.classList.add( "type-analysis__heading" );
    createTallies( defTallies );
    const atkTallies = defTallies.cloneNode( true );
    defTallies.classList.add( "type-analysis__grid", "type-analysis__grid_defense" );
    atkTallies.classList.add( "type-analysis__grid", "type-analysis__grid_attack" );
    const atkHeading = document.createElement( "h3" );
    atkHeading.innerHTML = "Coverage";
    atkHeading.classList.add( "type-analysis__heading" );
    analysis.append( defHeading, defTallies, atkHeading, atkTallies );
    analysis.querySelectorAll( ".tally__mark" ).forEach( mark => {
        mark.addEventListener( "mouseenter", highlightTargetPokemon );
        mark.addEventListener( "mouseleave", removeHighlights );
    });
    const note = document.querySelector( ".type-analysis__note" );
    analysis.append( note );

    // Create button to hide/show team analysis
    button = document.createElement( "button" );
    button.innerHTML = "Show Team Analysis";
    button.classList.add( "team__button" );
    button.addEventListener( "click", ( event ) => {
        const selector = "type-analysis_hidden";
        if ( analysis.classList.contains( selector ) ) {
            event.target.innerHTML = "Hide Team Analysis";
            analysis.classList.remove( selector );
        } else {
            event.target.innerHTML = "Show Team Analysis";
            analysis.classList.add( selector );
        }
    });
    section.append( analysis );
    buttonContainer.append( button );

    // Create button to show advanced controls
    button = document.createElement( "button" );
    button.innerHTML = "Hide Toggles";
    button.classList.add( "team__button" );
    button.addEventListener( "click", ( event ) => {
        document.querySelectorAll( ".slot__toggle-container" ).forEach( div => {
            const selector = "slot__toggle-container_hidden";
            if ( div.classList.contains( selector ) ) {
                event.target.innerHTML = "Hide Toggles";
                div.classList.remove( selector );
            } else {
                event.target.innerHTML = "Show Toggles";
                div.classList.add( selector );
            }
        });
    });
    buttonContainer.append( button );
}

/**
 * Populates a tooltip with buttons to change a Pokémon's Tera Type.
 * @param {HTMLElement} container
 */
function populateTeraPicker( container ) {
    if ( !gameData[ currentGame ].tera ) return;

    const picker = document.createElement( "ol" );
    picker.classList.add( "tera-picker", "tera-picker_hidden" );

    const typeData = getCurrentTypeData();
    Object.keys( typeData ).forEach( type => {
        const container = document.createElement( "li" );
        const button = document.createElement( "button" );

        picker.append( container );
        container.append( button );

        button.classList.add(
            "tera-picker__button", "tera-picker__button_" + type
        );
        button.dataset.type = type;
        button.innerHTML = capitalize( type );
        button.setAttribute( "title", capitalize( type ) );
        button.addEventListener( "click", terastallize );
    });

    container.append( picker );
}

/**
 * Adds a Pokémon to the current team.
 * @param {Event|string} event_or_slug
 */
function populateTeamSlot( event_or_slug ) {
    const slug = ( typeof event_or_slug === "string" )
        ? event_or_slug
        : event_or_slug.currentTarget.parentNode.dataset.slug;

    // Get slug without Gigantamax suffix
    const gmax = slug.endsWith( "-gmax" );
    const slug_nogmax = gmax ? slug.substring( 0, slug.length - "-gmax".length ) : slug;

    // Validate Pokémon exists in database, is part of current Pokédex, and has Gigantamax (if requested)
    if ( !( slug_nogmax in pokemonData ) ) {
        return;
    } else if ( !isInDex( pokemonData[ slug_nogmax ].base_id, pokemonData[ slug_nogmax ].form_id ) ) {
        return;
    } else if ( gmax && !pokemonData[ slug_nogmax ].has_gigantamax ) {
        return;
    }

    // Validate Pokémon is not duplicated
    const slugs = Array.from( document.querySelectorAll( ".slot_populated" ) ).map( li => li.dataset.slug );
    if ( slugs.includes( slug ) ) {
        return;
    }

    // Empty a team slot if team is full
    const slot = document.querySelector( ".slot_empty" );
    if ( slot == null ) {
        document.querySelector( ".slot__remove-button" ).click();
        return populateTeamSlot( slug );
    }

    const pokemon = pokemonData[ slug_nogmax ];
    const type = getPokemonType( pokemon );
    slot.dataset.type = type;
    slot.classList.add( "slot_populated" );
    slot.classList.remove( "slot_empty", "slot_hover" );
    slot.dataset.slug = slug;
    slot.dataset.tera = "";

    slot.querySelector( ".slot__bg-type-1" ).classList.add( "slot__bg-type-1_" + type[ 0 ] );
    slot.querySelector( ".slot__bg-type-2" ).classList.add( "slot__bg-type-2_" + type.slice( -1 ) );
    slot.querySelector( ".slot__info" ).classList.add( "slot__info_" + type[ 0 ] );

    const img = slot.querySelector( ".slot__pokemon-render" );
    if ( gmax ) img.classList.add( "slot__pokemon-render_gmax" );
    img.setAttribute( "src", getPokemonRenderUrl( pokemon, gmax ) );
    img.setAttribute( "alt", pokemon.name );

    slot.querySelector( ".slot__name" ).innerHTML = pokemon.name;

    const form = gmax ? "Gigantamax" : pokemon.form_name;
    var span =  slot.querySelector( ".slot__form" );
    if ( form ) {
        span.innerHTML = form;
        span.classList.remove( "slot__form_none" );
    } else {
        span.classList.add( "slot__form_none" );
    }

    span = slot.querySelectorAll( ".slot__type" );
    span.forEach( ( span, i ) => {
        span.classList.add( "slot__type_" + type[ i ] );
        span.innerHTML = ( type[ i ] ) ? capitalize( type[ i ] ) : "";
    });

    const genderToggle = slot.querySelector( ".slot__toggle_male, .slot__toggle_female" );
    if ( !gmax && pokemon.gender.length === 2 ) {
        genderToggle.classList.remove( "slot__toggle_hidden", "slot__toggle_male" );
        genderToggle.classList.add( "slot__toggle_female" );
        genderToggle.innerHTML = "&female;";
    } else {
        genderToggle.classList.add( "slot__toggle_hidden" );
    }
    const shinyToggle = slot.querySelector( ".slot__toggle_regular, .slot__toggle_shiny" );
    shinyToggle.classList.remove( "slot__toggle_hidden", "slot__toggle_shiny" );
    shinyToggle.classList.add( "slot__toggle_regular" );

    // Enable Tera Type toggle (except Terapagos)
    if ( gameData[ currentGame ].tera && !slug.includes( "terapagos" ) ) {
        const teraToggle = slot.querySelector( ".slot__toggle_tera" );
        teraToggle.classList.remove( "slot__toggle_hidden" );
    }

    const li = document.querySelector( ".pokedex-entry[data-slug='" + slug + "']" );
    if ( li ) {
        li.classList.add( "pokedex-entry_picked" );
        toggleEmptyDex();
    }

    updateTeamAnalysis();
    updateTeamHash();
}

/**
 * Removes a Pokémon from the current party.
 * @param {Event|string} event_or_slug
 */
 function clearTeamSlot( event_or_slug ) {
    var slot = ( typeof event_or_slug === "string" )
        ? document.querySelector( ".slot[data-slug='" + slug + "']" )
        : event_or_slug.currentTarget.parentNode;

    const slug = slot.dataset.slug;
    if ( slug === "" ) return;

    const type = slot.dataset.type.split( "," );
    const tera = slot.dataset.tera;

    // Empty data
    slot.classList.add( "slot_empty" );
    slot.classList.remove( "slot_hover", "slot_populated" );
    slot.dataset.slug = "";
    slot.dataset.type = "";
    slot.dataset.tera = "";

    slot.querySelector( ".slot__bg-type-1" ).classList.remove(
        "slot__bg-type-1_" + type[ 0 ], "slot__bg-type-1_" + tera
    );
    slot.querySelector( ".slot__bg-type-2" ).classList.remove(
        "slot__bg-type-2_" + type.slice( -1 ), "slot__bg-type-2_" + tera
    );
    slot.querySelector( ".slot__info" ).classList.remove(
        "slot__info_" + type[ 0 ], "slot__info_" + tera
    );

    const img = slot.querySelector( ".slot__pokemon-render" );
    img.classList.remove( "slot__pokemon-render_gmax" );
    img.setAttribute( "src", UNKNOWN_IMG );
    img.setAttribute( "alt", "" );

    slot.querySelector( ".slot__name" ).innerHTML = "???";
    const span = slot.querySelector( ".slot__form" );
    span.innerHTML = "";
    span.classList.add( "slot__form_none" );
    slot.querySelectorAll( ".slot__type" ).forEach( span => {
        span.setAttribute( "class", "slot__type" );
        span.innerHTML = "";
    });
    const genderToggle = slot.querySelector( ".slot__toggle_male, .slot__toggle_female" );
    genderToggle.classList.remove( "slot__toggle_male" );
    genderToggle.classList.add( "slot__toggle_hidden", "slot__toggle_female" );
    genderToggle.innerHTML = "&female;";
    const shinyToggle = slot.querySelector( ".slot__toggle_regular, .slot__toggle_shiny" );
    shinyToggle.classList.remove( "slot__toggle_shiny" );
    shinyToggle.classList.add("slot__toggle_hidden", "slot__toggle_regular" );
    const teraToggle = slot.querySelector( ".slot__toggle_tera" );
    teraToggle.classList.remove( "slot__toggle_tera_" + tera );
    teraToggle.classList.add(
        "slot__toggle_hidden", "slot__toggle_tera_none", "slot__toggle_tera_picked"
    );

    // Move to last place
    slot.parentNode.append( slot );

    const li = document.querySelector( ".pokedex-entry[data-slug='" + slug + "']" );
    if ( li ) {
        li.classList.remove( "pokedex-entry_picked" );
        toggleEmptyDex();
    }

    updateTeamAnalysis();
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
        String( pokemon.base_id ).padStart( 4, "0" ),
        String( pokemon.form_id ).padStart( 3, "0" ),
        ( gmax && pokemon.gender.length > 1 ) ? "mf" : pokemon.gender[ 0 ],
        gmax ? "g" : "n"
    ].join( "_" ) + ".png";
}

/**
 * Toggles the gender of a Pokémon.
 * @param {Event|string} event_or_slug
 */
function toggleGender( event_or_slug ) {
    var slot = ( typeof event_or_slug === "string" )
        ? document.querySelector( ".slot[data-slug='" + slug + "']" )
        : event_or_slug.currentTarget.closest( "li[data-slug]" );

    const slug = slot.dataset.slug;
    if ( pokemonData[ slug ].gender.length !== 2 ) return;

    const button = slot.querySelector( ".slot__toggle_male, .slot__toggle_female" );
    const img = slot.querySelector( ".slot__pokemon-render" );
    var src = img.getAttribute( "src" );
    src = src.replace( /[fm]d/g, ( m ) => {
        return { md: "fd", fd: "md" }[ m ]
    });
    img.setAttribute( "src", src );
    if ( src.includes( "fd" ) ) {
        button.classList.remove( "slot__toggle_male" );
        button.classList.add( "slot__toggle_female" );
        button.innerHTML = "&female;";
    } else {
        button.classList.add( "slot__toggle_male" );
        button.classList.remove( "slot__toggle_female" );
        button.innerHTML = "&male;";
    }
}

/**
 * Toggles a Pokémon's shinyness.
 * @param {Event|slug} event_or_slug
 */
function toggleShiny( event_or_slug ) {
    var slot = ( typeof event_or_slug === "string" )
        ? document.querySelector( ".slot[data-slug='" + slug + "']" )
        : event_or_slug.currentTarget.closest( ".slot[data-slug]" );

    const img = slot.querySelector( ".slot__pokemon-render" );
    var src = img.getAttribute( "src" ).split("/");
    var dir = "pokemon";
    const button = slot.querySelector( ".slot__toggle_regular, .slot__toggle_shiny" );
    if ( button.classList.contains( "slot__toggle_shiny" ) ) {
        button.classList.add( "slot__toggle_regular" );
        button.classList.remove( "slot__toggle_shiny" );
    } else {
        button.classList.add( "slot__toggle_shiny" );
        button.classList.remove( "slot__toggle_regular" );
        dir = "shiny-pokemon";
    }
    src = [ ...src.slice( 0, src.length - 2 ), dir, src[ src.length - 1 ] ].join( "/" );
    img.setAttribute( "src", src );
}

/**
 * Show the Tera Type picker.
 * @param {Event|slug} event_or_slug
 */
function showTeraPicker( event_or_slug ) {
    if ( !gameData[ currentGame ].tera ) return;

    var slot = ( typeof event_or_slug === "string" )
        ? document.querySelector( ".slot[data-slug='" + slug + "']" )
        : event_or_slug.currentTarget.closest( ".slot[data-slug]" );

    const icon = slot.querySelector( ".slot__toggle_tera" );
    if ( icon.classList.contains( "slot__toggle_tera_none" ) ) {
        // Show tera type picker
        const picker = document.querySelector( ".tera-picker" );
        if ( slot.contains( picker )
            && picker.classList.contains( "tera-picker_active" )
        ) {
            // Hide if already open and clicking button again
            picker.classList.remove( "tera-picker_active" );
            picker.classList.add( "tera-picker_hidden" );
            document.removeEventListener( "click", hideTeraPicker );
        } else {
            // Move picker to current slot
            slot.querySelector( ".slot__toggle-container" ).append( picker );
            // Terastallize Ogerpon (fixed Tera)
            switch ( slot.dataset.slug ) {
                case "ogerpon":
                    picker.querySelector( ".tera-picker__button_grass" ).click();
                    break;
                case "ogerpon-wellspring":
                    picker.querySelector( ".tera-picker__button_water" ).click();
                    break;
                case "ogerpon-hearthflame":
                    picker.querySelector( ".tera-picker__button_fire" ).click();
                    break;
                case "ogerpon-cornerstone":
                    picker.querySelector( ".tera-picker__button_rock" ).click();
                    break;
                default:
                    // Show Tera Type picker
                    picker.classList.add( "tera-picker_active" );
                    picker.classList.remove( "tera-picker_hidden" );
                    document.addEventListener( "click", hideTeraPicker );
            }
        }
    } else {
        // Remove tera type
        const type = slot.dataset.type.split( "," );
        const tera = slot.dataset.tera;

        const info = slot.querySelector( ".slot__info" );
        const bg1 = slot.querySelector( ".slot__bg-type-1" );
        const bg2 = slot.querySelector( ".slot__bg-type-2" );

        // Remove tera type style
        icon.classList.remove( "slot__toggle_tera_picked" );
        icon.classList.remove( "slot__toggle_tera_" + tera );
        info.classList.remove( "slot__info_" + tera );
        bg1.classList.remove( "slot__bg-type-1_" + tera );
        bg2.classList.remove( "slot__bg-type-2_" + tera );

        // Reinstate type style
        icon.setAttribute( "title", "Terastallize" );
        icon.classList.add( "slot__toggle_tera_none" );
        info.classList.add( "slot__info_" + type[ 0 ] );
        bg1.classList.add( "slot__bg-type-1_" + type[ 0 ] );
        bg2.classList.add( "slot__bg-type-2_" + type.slice( -1 ) );
        slot.dataset.tera = "";
        updateTeamAnalysis();
    }
}

/**
 * Hide the Tera Type picker.
 * @param {Event} event
 */
 function hideTeraPicker( event ) {
    const target = event.target;
    const picker = document.querySelector( ".tera-picker_active" );
    // Detect click outside dropdown menu
    if ( picker == null
        || (
            !picker.contains( target )
            && !picker.parentElement.querySelector( ".slot__toggle_tera" ).contains( target )
        ) ) {
        const picker = document.querySelector( ".tera-picker" );
        picker.classList.remove( "tera-picker_active" );
        picker.classList.add( "tera-picker_hidden" );
        document.removeEventListener( "click", hideTeraPicker );
    }
}

/**
 * Change the Tera Type of a Pokémon.
 * @param {Event} event
 */
function terastallize( event ) {
    const slot = event.currentTarget.closest( ".slot[data-slug]" );
    const type = slot.dataset.type.split( "," );
    const tera = event.currentTarget.dataset.type;

    const icon = slot.querySelector( ".slot__toggle_tera" );
    const info = slot.querySelector( ".slot__info" );
    const bg1 = slot.querySelector( ".slot__bg-type-1" );
    const bg2 = slot.querySelector( ".slot__bg-type-2" );

    // Remove current type style
    icon.setAttribute( "title", "Reset Type" );
    icon.classList.remove( "slot__toggle_tera_none" );
    info.classList.remove( "slot__info_" + type[ 0 ] );
    bg1.classList.remove( "slot__bg-type-1_" + type[ 0 ] );
    bg2.classList.remove( "slot__bg-type-2_" + type.slice( -1 ) );

    // Add tera type style
    icon.classList.add( "slot__toggle_tera_picked" );
    icon.classList.add( "slot__toggle_tera_" + tera );
    info.classList.add( "slot__info_" + tera );
    bg1.classList.add( "slot__bg-type-1_" + tera );
    bg2.classList.add( "slot__bg-type-2_" + tera );
    slot.dataset.tera = tera;

    // Hide picker
    const picker = slot.querySelector( ".tera-picker" );
    picker.classList.add( "tera-picker_hidden" );
    picker.classList.remove( "tera-picker_active" );

    updateTeamAnalysis();
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
    document.querySelectorAll( ".slot_populated .slot__remove-button" ).forEach( li => {
        li.click();
    });
    // List Pokémon that can be added to the team
    const slugs = Array.from(
        document.querySelectorAll( ".pokedex-entry:not(.pokedex-entry_filtered):not(.pokedex-entry_picked)" )
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
 */
function populateDexes( container ) {
    const game = gameData[ currentGame ];

    const h1 = document.querySelector( ".head__game-name" );
    const section = document.createElement( "section" );
    const h2 = document.createElement( "h2" );
    const div = document.createElement( "div" );
    const ol = document.createElement( "ol" );

    h1.parentNode.classList.add( "head__game-button" );
    h1.innerHTML = getGameName( game );
    h1.classList.add( "head__game-logo", "head__game-logo_" + currentGame );
    h1.style.backgroundImage = "url('" + GAME_PATH + currentGame + ".png')";
    container.prepend( section );
    section.append( h2, div, ol );
    section.classList.add( "tail__picker" );
    h2.innerHTML = "Your Options";
    h2.classList.add( "picker__heading" );
    div.classList.add( "picker__filters" );
    ol.classList.add( "picker__pokedexes" );

    game.dex_slugs.forEach( ( slug, i ) => {
        let li = document.createElement( "li" );
        let heading = document.createElement( "h3" );
        let pokedex = document.createElement( "ol" );
        li.classList.add( "picker__pokedex-container" );

        ol.append( li );
        li.append( heading );
        heading.innerHTML = dexData[ slug ].name;
        heading.classList.add( "picker__pokedex-name" );
        li.append( pokedex );
        pokedex.id = slug;
        pokedex.classList.add( "picker__pokedex" );

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
                tup => tup[ 1 ].base_id === base_id && tup[ 1 ].form_id === form_id
            );
            if ( currentGame === "lza"
                && pokemon.generation === 9
                && !AVAIL_ZA_IMAGES.includes( slug )
            )  return;
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
    button.classList.add( "pokedex-entry__button" );

    li.dataset.slug = slug;
    li.dataset.id = pokemon.base_id;
    li.dataset.formId = pokemon.form_id;
    li.setAttribute( "title", pokemon.name );
    li.classList.add( "pokedex-entry" )

    img.setAttribute( "alt", pokemon.name );
    img.setAttribute( "src", getPokemonRenderUrl( pokemon ) );
    img.setAttribute( "loading", "lazy" );
    img.classList.add( "pokedex-entry__thumb" );

    // If Pokémon can Gigantamax, duplicate its entry
    if ( gameData[ currentGame ].gmax
        && pokemon.has_gigantamax && !pokemon.is_cosmetic ) {
        const clone = li.cloneNode( true );
        clone.dataset.slug = slug + "-gmax";
        clone.querySelector( "button" ).addEventListener( "click", populateTeamSlot );
        clone.querySelector( "img" ).setAttribute( "src", getPokemonRenderUrl( pokemon, true ) );
        return [ li, clone ];
    }
    return [ li ];
}

/**
 * Given an array of IDs or slugs, replace the IDs with corresponding slugs if possible.
 * If an input is an ID, only keep it when a matching slug has been found to replace it.
 * @param {string[]} ids_or_slugs
 * @return {string[]} Formated slugs array with names instead of IDs
 */
function idToSlug( ids_or_slugs ) {
    const slugs = [];
    ids_or_slugs.forEach( ( id_or_slug ) => {
        // Not a number means probably a slug
        if ( isNaN( id_or_slug ) ) {
            slugs.push( id_or_slug );
            return;
        };
        // Convert ID to slug if possible
        const base_id = parseInt( id_or_slug );
        for ( const slug in pokemonData ) {
            if ( pokemonData[ slug ].base_id === base_id ) {
                slugs.push( slug );
                break;
            }
        }
    });
    return slugs;
}

/**
 * Completes each Pokémon's entry with additional data (e.g., type effectiveness data).
 */
function completePokemonData() {
    const pokemonEntries = Object.entries( pokemonData );
    const typeData = getCurrentTypeData();
    Object.values( pokemonData ).filter(
        pokemon => isInDex( pokemon.base_id, pokemon.form_id )
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
        if ( pokemon.evolution_ids ) {
            pokemon.fully_evolved = !pokemon.evolution_ids.some( id => {
                const [ base_id, form_id ] = id;
                // Check if evolution is available in dex (some evolutions may not be available in certain dexes)
                return isInDex( base_id, form_id );
            });
        }
        // Check if Pokémon is non-legendary
        if ( gameData[ currentGame ].gen < 9 && pokemon.is_ub ) {
            // Prior to Gen 9, UBs were tagged as sub-legendary
            pokemon.is_sublegendary = true;
        }
        if ( !( pokemon.is_sublegendary || pokemon.is_legendary || pokemon.is_mythical ) ) {
            pokemon.is_nonlegendary = true;
        }
        // Check if Pokémon is cosmetic/battle-only/Arceus/Silvally
        if (
            ( pokemon.is_battle_only && !pokemon.is_mega )
            || pokemon.is_cosmetic
            || ( pokemon.form_id > 0
                && ( pokemon.name === "Arceus" || pokemon.name === "Silvally")
            )
        ) {
            pokemon.is_misc_form = true;
        };
        if ( currentGame == "sv" && pokemon.name == "Vivillon" ) {
            pokemon.is_misc_form = pokemon.form_name != "Fancy Pattern";
        };
        // Check if Pokémon is base form
        if ( pokemon.is_mega || !pokemon.is_misc_form ) {
            pokemon.is_not_misc_form = true;
        };
    });
    Object.entries( versionData ).forEach( tup => {
        const [ version, ids ] = tup;
        ids.forEach( id => {
            const [ base_id, form_id ] = id;
            const [ slug, pokemon ] = pokemonEntries.find(
                tup => tup[ 1 ].base_id === base_id && tup[ 1 ].form_id === form_id
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
        return pokemon.pokemon_type;
    }
    return pokemon.past_type.pokemon_type;
}

//#endregion
//#region Filters

const COLORS = [
    "red", "blue", "yellow", "green", "black",
    "brown", "purple", "gray", "white", "pink"
];
const EXPERIENCE = [
    "Erratic", "Fast", "Medium Fast", "Medium Slow", "Slow", "Fluctuating"
];
const SHAPES = 14;

/**
 * Populate the drop-down menus with the available filters.
 */
function populateFilters() {
    const filters = document.querySelector( ".picker__filters" );
    const types = Object.keys( getCurrentTypeData() );
    // Type
    var type_dropdown = createFilter( filters, "type", "Type" );
    type_dropdown.classList.add( "filter__dropdown-menu_3col" );
    // Evolution
    var dropdown = createFilter( filters, "evolution", "Evolution" );
    dropdown.append( createCheckbox( "evolution", "Not Fully Evolved", "nfe" ) );
    dropdown.append( createCheckbox( "evolution", "Fully Evolved", "fe" ) );
    if ( gameData[ currentGame ].mega ) dropdown.append(
        createCheckbox( "evolution", "Mega Evolved", "mega" )
    );
    // Generation
    dropdown = createFilter( filters, "gen", "Generation" );
    if ( gameData[ currentGame ].gen > 6 ) dropdown.classList.add( "filter__dropdown-menu_2col" );
    for ( let i = 1; i <= gameData[ currentGame ].gen; i++ ) {
        dropdown.append( createCheckbox( "gen", "Generation " + toRoman( i ), i ) );
    }
    // Version
    const disabled = currentVersions.length === 0;
    dropdown = createFilter( filters, "version", "Version", true, true, disabled );
    if ( !disabled ) {
        const both_text = currentVersions.length > 2 ? "All Versions" : "Both Versions";
        dropdown.append( createCheckbox( "version", both_text, "both" ) );
        gameData[ currentGame ].versions.forEach( version => {
            dropdown.append( createCheckbox( "version", version.name, version.slug ) );
        });
        if ( gameData[ currentGame ].transfer ) {
            dropdown.append( createCheckbox( "version", "Transfer-Only", "transfer_" + currentGame ) );
        }
    }
    // Exclude Type
    var dropdown = createFilter( filters, "exclude-type", "Exclude Type", true, false );
    dropdown.classList.add( "filter__dropdown-menu_3col" );
    types.forEach( value => {
        type_dropdown.append( createCheckbox( "type", capitalize( value ), value ) );
        dropdown.append( createCheckbox( "exclude-type", capitalize( value ), value, false ) );
    });
    // Category
    dropdown = createFilter( filters, "tag", "Tag" );
    dropdown.append( createCheckbox( "tag", "Non-Legendary", "is_nonlegendary" ) );
    dropdown.append( createCheckbox( "tag", "Sub-Legendary", "is_sublegendary" ) );
    dropdown.append( createCheckbox( "tag", "Legendary", "is_legendary" ) );
    dropdown.append( createCheckbox( "tag", "Mythical", "is_mythical" ) );
    const checkbox = createCheckbox( "tag", "All Forms", "is_not_misc_form" );
    checkbox.classList.add( "dropdown-menu-item_hidden" );
    checkbox.querySelector( "input" ).setAttribute( "readonly", "" );
    dropdown.append( checkbox );
    if ( gameData[ currentGame ].gen >= 2 ) {
        if ( gameData[ currentGame ].gmax ) dropdown.append(
            createCheckbox( "tag", "Gigantamax", "gmax" )
        );
        dropdown.append( createCheckbox( "tag", "Misc. Forms", "is_misc_form", false ) );
    }
    // Color
    dropdown = createFilter( filters, "color", "Color" );
    dropdown.classList.add( "filter__dropdown-menu_2col" );
    COLORS.forEach( value => {
        dropdown.append( createCheckbox( "color", capitalize( value ), value ) );
    });
    // Search
    createSearchBar( filters );
    // Experience
    dropdown = createFilter( filters, "experience", "Experience" );
    EXPERIENCE.forEach( value => {
        dropdown.append( createCheckbox( "experience", value, value ) );
    });
    // Shape
    dropdown = createFilter( filters, "shape", "Shape" );
    dropdown.classList.add( "filter__dropdown-menu_icons" );
    [...Array(SHAPES).keys()].forEach( value => {
        dropdown.append( createShapeCheckbox( value + 1 ) );
    });
    // Fire change event to hide misc. forms
    const input = document.getElementById( "filter-tag-is_misc_form" );
    if ( input != null ) {
        const event = new Event( "change" );
        input.dispatchEvent( event );
    }
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
    dropdown.classList.add( "filter__dropdown-menu" );
    if ( inclSelectAll ) dropdown.append( createCheckbox( type, "Select All", "all", selectAll ) );

    const div = document.createElement( "div" );
    div.dataset.type = type;
    div.classList.add( "filter" );

    const label = document.createElement( "label" );
    label.classList.add( "filter__name" );
    label.setAttribute( "for", type + "-filter" );
    label.innerHTML = name;

    const button = document.createElement( "button" );
    button.classList.add( "filter__button" );
    button.id = type + "-filter";
    if ( !disabled ) {
        button.innerHTML = selectAll ? "All Selected" : "None Selected";
        button.addEventListener( "click", expandDropdown );
        div.classList.add( "filter_enabled" );
    } else {
        button.innerHTML = "N/A";
        div.classList.add( "filter_disabled" );
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
    label.classList.add( "filter__name" );
    label.setAttribute( "for", "search-bar" );
    label.innerHTML = "Search";

    const input = document.createElement( "input" );
    input.id = "search-bar";
    input.classList.add( "filter__search-bar" );
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
    const active = parent.classList.contains( "filter_active" );
    // Collapse all dropdown menus
    document.querySelectorAll( ".filter" ).forEach( filter => {
        filter.classList.remove( "filter_active" );
    });
    // Expand/collapse dropdown menu
    if ( active ) {
        parent.classList.remove( "filter_active" );
    } else {
        parent.classList.add( "filter_active" );
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
    if ( !target.closest( ".filter_active :where(button, .filter__dropdown-menu)" ) ) {
        document.querySelectorAll( ".filter_active" ).forEach( div => div.classList.remove( "filter_active" ) );
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
    li.classList.add( "dropdown-menu-item" );
    if ( checked ) li.classList.add( "dropdown-menu-item_active" );

    const input = document.createElement( "input" );
    input.id = [ "filter", type, value ].join( "-" );
    input.classList.add( "dropdown-menu-item__checkbox" );
    input.setAttribute( "name", type );
    input.setAttribute( "value", value );
    input.setAttribute( "type", isRadio ? "radio" : "checkbox" );
    if ( checked ) input.setAttribute( "checked", "" );
    input.addEventListener( "change", changeCheckbox );

    const label = document.createElement( "label" );
    label.classList.add( "dropdown-menu-item__name" );
    label.setAttribute( "for", input.id );
    label.innerHTML = name;

    li.append( label, input );
    return li;
}


const SHAPE_PATH = IMG_PATH + "shape/";

/**
 * Creates a checkbox option for the shape filter (has icon instead of text).
 * @param {string} value
 * @returns {HTMLLIElement}
 */
function createShapeCheckbox( value ) {
    const li = document.createElement( "li" );
    li.classList.add( "dropdown-menu-item" );
    li.classList.add( "dropdown-menu-item_active" );

    const input = document.createElement( "input" );
    input.id = [ "filter", "shape", value ].join( "-" );
    input.classList.add( "dropdown-menu-item__checkbox" );
    input.setAttribute( "name", "shape" );
    input.setAttribute( "value", value );
    input.setAttribute( "type", "checkbox" );
    input.setAttribute( "checked", "" );
    input.addEventListener( "change", changeCheckbox );

    const label = document.createElement( "label" );
    label.classList.add( "dropdown-menu-item__name" );
    label.setAttribute( "for", input.id );

    const img = document.createElement( "img" );
    img.classList.add( "dropdown-menu-item__icon" );
    img.setAttribute( "src", SHAPE_PATH + value.toString() + ".png" );
    label.append( img );

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
    const activeClass = "dropdown-menu-item_active";
    // If target is checked, add "active" class
    if ( target.checked ) {
        // If target was "all", add "active" class to all options
        if ( target.value === "all" ) {
            document.querySelectorAll( selector ).forEach( input => {
                input.checked = true;
                input.parentNode.classList.add( activeClass );
            });
        } else {
            target.parentNode.classList.add( activeClass );
        }
    // If target was unchecked, remove "active" class
    } else {
        // If target was "all", remove "active" class from all options
        if ( target.value === "all" ) {
            document.querySelectorAll( selector ).forEach( input => {
                input.checked = false;
                input.parentNode.classList.remove( activeClass );
            });
        } else {
            target.parentNode.classList.remove( activeClass );
            const all = document.querySelector( selector + "[value='all']" );
            if ( all ) {
                all.checked = false;
                all.parentNode.classList.remove( activeClass );
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
            all.parentNode.classList.add( activeClass );
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
                button.innerHTML = String( checkedOptions.length ) + " Selected";
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
        ".dropdown-menu-item_active input[name='" + type + "']"
    ) );
    return selection.map( input => input.value );
}

/**
 * Returns true if Pokémon is in version
 * @param {Object} pokemon
 * @param {string[]} versions
 * @returns
 */
function pokemonIsInVersion( pokemon, versions ) {
    const pokemonVersion = pokemon.version || [];
    return (
        currentVersions.length === 0
        || (
            versions.length > 0
            && (
                (
                    versions.includes( "both" )
                    && (
                        pokemonVersion.length === 0
                        || (
                            currentVersions.every( version => !pokemonVersion.includes( version ) )
                            && !pokemonVersion.includes( "transfer_" + currentGame )
                        )
                    )
                ) || (
                    versions.some( version => pokemonVersion.includes( version ) )
                )
            )
        )
    );
}

/**
 * Returns true if type is in selected types.
 * @param {string[]} type
 * @param {string[]} selection
 * @returns bool
 */
function pokemonTypeIsSelected( type, selection ) {
    return (
        selection.length > 0
        && (
            selection.includes( "all" )
            || selection.includes( type[ 0 ] )
            || ( type[ 1 ] && selection.includes( type[ 1 ] ) )
        )
    );
}

/**
 * Returns true if Pokémon is in selected generations. Force Gigantamax Pokémon
 * to be Generation 8.
 * @param {string[]} type
 * @param {bool} is_gigantamax
 * @param {string[]} selection
 * @returns bool
 */
function pokemonIsInGeneration( pokemon, is_gigantamax, generations ) {
    return (
        generations.length > 0
        && (
            generations.includes( "all" )
            || ( is_gigantamax && generations.includes( "8" ) )
            || ( !is_gigantamax && generations.includes( pokemon.generation.toString() ) )
        )
    );
}

/**
 * Returns true if Pokémon is any of the given evolutionary stages.
 * @param {Object} pokemon
 * @param {string[]} stages
 * @returns
 */
function pokemonIsEvolutionaryStage( pokemon, stages ) {
    return (
        stages.length > 0
        && (
            stages.includes( "all" )
            || ( stages.includes( "nfe" ) && !pokemon.fully_evolved )
            || ( stages.includes( "fe" ) && pokemon.fully_evolved && !pokemon.is_mega )
            || ( stages.includes( "mega" ) && pokemon.is_mega )
        )
    );
}

/**
 * Returns true if Pokémon has any of the given tags.
 * @param {Object} pokemon
 * @param {bool} is_gigantamax
 * @param {string[]} tags
 * @returns
 */
function pokemonIsTagged( pokemon, is_gigantamax, tags ) {
    if ( tags.length === 0 ) return false;
    if ( tags.includes( "all" ) ) return true;
    const tag_group_a = tags.filter( tag => {
        return !tag.includes( "misc_form" );
    });
    if ( tag_group_a.length === 0 ) return false;
    const tag_group_b = difference( tags, tag_group_a );
    return (
        is_gigantamax
        ? tag_group_a.includes( "gmax" )
        : (
            tag_group_a.some( tag => tag in pokemon )
            && tag_group_b.some( tag => tag in pokemon )
        )
    );
}

/**
 * Returns true if Pokémon is any of the given colors.
 * @param {Object} pokemon
 * @param {string[]} colors
 * @returns
 */
function pokemonIsColor( pokemon, colors ) {
    return (
        colors.length > 0
        && (
            colors.includes( "all" )
            || colors.includes( pokemon.color )
        )
    );
}

/**
 * Returns true if Pokémon is in any of the given Experience groups.
 * @param {Object} pokemon
 * @param {string[]} groups
 * @returns
 */
function pokemonIsInExperienceGroup( pokemon, groups ) {
    return (
        groups.length > 0
        && (
            groups.includes( "all" )
            || groups.includes( pokemon.experience_group )
        )
    );
}

/**
 * Returns true if Pokémon is any of the given shapes.
 * @param {Object} pokemon
 * @param {string[]} shapes
 * @returns
 */
function pokemonIsShaped( pokemon, shapes ) {
    return (
        shapes.length > 0
        && (
            shapes.includes( "all" )
            || shapes.includes( pokemon.shape.toString() )
        )
    );
}

/**
 * Filters the Pokémon list based on the selected filters.
 */
function filterDex() {
    const [ gens, tags, types, exclTypes, evolutions, versions, colors, groups, shapes ] = [
        getSelectedFilters( "gen" ), getSelectedFilters( "tag" ),
        getSelectedFilters( "type" ), getSelectedFilters( "exclude-type" ),
        getSelectedFilters( "evolution" ), getSelectedFilters( "version" ),
        getSelectedFilters( "color" ), getSelectedFilters( "experience" ),
        getSelectedFilters( "shape" )
    ];
    const query = normalize( document.getElementById( "search-bar" ).value );
    document.querySelectorAll( ".pokedex-entry" ).forEach( li => {
        var slug = li.dataset.slug;
        const gmax = slug.endsWith( "-gmax" );
        if ( gmax ) slug = slug.substring( 0, slug.length - 5 );
        const pokemon = pokemonData[ slug ];
        const type = getPokemonType( pokemon );
        // Check if Pokémon
        const matchesQuery = query.length === 0 || slug.indexOf( query ) >= 0;
        if ( matchesQuery
            && pokemonIsInGeneration( pokemon, gmax, gens )
            && pokemonTypeIsSelected( type, types )
            && !pokemonTypeIsSelected( type, exclTypes )
            && pokemonIsEvolutionaryStage( pokemon, evolutions )
            && pokemonIsInVersion( pokemon, versions )
            && pokemonIsTagged( pokemon, gmax, tags )
            && pokemonIsColor( pokemon, colors )
            && pokemonIsInExperienceGroup( pokemon, groups )
            && pokemonIsShaped( pokemon, shapes )
        ) {
            li.classList.remove( "pokedex-entry_filtered" );
            return;
        }
        li.classList.add( "pokedex-entry_filtered" );
    });
    toggleEmptyDex();
}

/**
 * Hides/shows any Pokédex that is empty (i.e., all Pokémon picked or filtered).
 */
function toggleEmptyDex() {
    document.querySelectorAll( ".picker__pokedex" ).forEach( ol => {
        if ( ol.children.length === ol.querySelectorAll( ":where(.pokedex-entry_filtered, .pokedex-entry_picked)" ).length ) {
            ol.parentNode.classList.add( "picker__pokedex-container_hidden" );
        } else {
            ol.parentNode.classList.remove( "picker__pokedex-container_hidden" );
        }
    });
}

//#endregion
//#region Team Analysis

const TYPE_PATH = IMG_PATH + "type/";

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
 * Creates tallies for each type and appends to container.
 * @param {HTMLElement} container
 */
function createTallies( container ) {
    const template = document.getElementById( "tally" );
    template.innerHTML = template.innerHTML.replace( />\s+</g, "><" );
    const typeData = getCurrentTypeData();
    Object.keys( typeData ).forEach( type => {
        const clone = template.content.cloneNode( true );
        const symbol = clone.querySelector( ".tally__type-symbol" );
        const typeName = capitalize( type );
        clone.querySelector( ".tally" ).classList.add( "tally_" + type );
        symbol.innerHTML = capitalize( typeName );
        symbol.setAttribute( "title", typeName );
        container.append( clone );
    });
}

/**
 * Highlight a tally's target Pokémon.
 * @param {Event} event
 */
function highlightTargetPokemon( event ) {
    const slug = event.currentTarget.dataset.slug;
    if ( slug === "" ) return;
    document.querySelectorAll( ".slot" ).forEach( slot => {
        if ( slug === slot.dataset.slug ) return;
        slot.classList.add( "slot_grayscale" );
    });
}

/**
 * Remove any highlighted Pokémon.
 * @param {Event} event
 * @returns
 */
function removeHighlights( event ) {
    const slug = event.currentTarget.dataset.slug;
    if ( slug === "" ) return;
    document.querySelectorAll( ".slot" ).forEach( slot => {
        slot.classList.remove( "slot_grayscale" );
    });
}


/**
 * Calculates how many Pokémon resist, are weak to, or can deal super effective
 * damage to each type.
 */
function updateTeamAnalysis() {
    const typeData = getCurrentTypeData();
    // Fetch current Pokémon slugs
    const slots = document.querySelectorAll( ".slot_populated" );
    const slugs = Array.from( slots ).map( li => li.dataset.slug );
    const teras = Array.from( slots ).map( li => li.dataset.tera );
    // Update team defense and offense
    const defTallies = document.querySelector( ".type-analysis__grid_defense" );
    const atkTallies = document.querySelector( ".type-analysis__grid_attack" );
    Object.keys( getCurrentTypeData() ).forEach( type => {
        const weakPokemon = [], resistPokemon = [], coveragePokemon = [];
        // Update counts per type (resistances includes immunities)
        for ( let i = 0; i < slugs.length; i++ ) {
            let slug = slugs[ i ];
            let tera = teras[ i ];
            if ( slug.endsWith( "-gmax" ) ) slug = slug.substring( 0, slug.length - 5 );
            // If no tera type, use Pokémon data
            // If tera type, use type data
            if (
                ( !tera && pokemonData[ slug ][ "weaknesses" ].includes( type ) )
                || ( tera && typeData[ tera ].weak2.includes( type ) )
            ) {
                weakPokemon.push( slugs[ i ] );
            } else if (
                (
                    !tera && (
                        pokemonData[ slug ][ "resistances" ].includes( type )
                        || pokemonData[ slug ][ "immunities" ].includes( type )
                    )
                ) || (
                    tera && (
                        typeData[ tera ].resists.includes( type )
                        || typeData[ tera ].immune2.includes( type )
                    )
                )
            ) {
                resistPokemon.push( slugs[ i ] );
            }
            if (
                pokemonData[ slug ][ "coverage" ].includes( type )
                || ( tera && typeData[ tera ].weakens.includes( type ) )
            ) {
                coveragePokemon.push( slugs[ i ] );
            }
        }
        const defCount = resistPokemon.length - weakPokemon.length;
        const atkCount = coveragePokemon.length;
        const selector = ".tally_" + type;
        if ( defCount < 0 ) {
            defTallies.querySelector( selector ).classList.add( "tally_warning" );
        } else {
            defTallies.querySelector( selector ).classList.remove( "tally_warning" );
        }
        if ( defCount + atkCount < 0 ) {
            atkTallies.querySelector( selector ).classList.add( "tally_warning" );
        } else {
            atkTallies.querySelector( selector ).classList.remove( "tally_warning" );
        }
        defTallies.querySelectorAll( selector + " .tally__mark" ).forEach( element => {
            element.setAttribute( "class", "tally__mark" );
            if ( weakPokemon.length > 0 ) {
                element.dataset.slug = weakPokemon.shift();
                element.classList.add( "tally__mark_negative" );
                element.innerHTML = -1;
            } else if ( resistPokemon.length > 0 ) {
                element.dataset.slug = resistPokemon.shift();
                element.classList.add( "tally__mark_positive" );
                element.innerHTML = 1;
            } else {
                element.dataset.slug = "";
                element.innerHTML = 0;
            }
        });
        atkTallies.querySelectorAll( selector + " .tally__mark" ).forEach( element => {
            element.setAttribute( "class", "tally__mark" );
            if ( coveragePokemon.length > 0 ) {
                element.dataset.slug = coveragePokemon.shift();
                element.classList.add( "tally__mark_positive" );
                element.innerHTML = 1;
            } else {
                element.dataset.slug = "";
                element.innerHTML = 0;
            }
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
                slugs = idToSlug( slugs );  // Convert IDs (if any) to slugs
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
    document.querySelectorAll( ".slot_populated" ).forEach( li => {
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

var map;
var nav = [];
var MarkANDInfoW = [];
var storeA = [];
var QueryMarker = [];
var ListLinkMarker = [];
var ListLinkInfoWindow = [];
var store;
var activeWindow;
var activeWindowList;
var ident = 0;

// you get this URL by exporting your MyMaps in .kml and by checking the box ".KML with network link"
var kmlURL = "//google.com/maps/d/kml?forcekml=1&mid=1pnMJVDQtbF8wrWycWhdfGtiVLnEHtSh0"; //paste yours !

//just something to start with when we want to generate our "View on maps" link in infowindow
var StartMPLINK = 'https://www.google.com/maps/place/';

//Just init the map
function initMap(){
        
        map = new google.maps.Map(document.getElementById('map'), {
            center: new google.maps.LatLng(48.583073, 7.753258),
            zoom: 13,
            gestureHandling: 'greedy'
        });

        
    }
    //Allow us to create a marker
    function createMarker(store){

        var marker = new google.maps.Marker({
            position: store.latlng,
            title: store.place,
            map: map,
            ident: store.ident,
            });
        
        var infowindow = new google.maps.InfoWindow({
         });
        //handle the infowindow, triggered by MarkerClick or ListClick
        google.maps.event.addListener(marker, 'click', function() {
            map.panTo(marker.position);
            if (activeWindow != null) {
                activeWindow.close();
            }
            if (activeWindowList != null) {
                activeWindowList.close();
            }
           
            infowindow.setContent(store.desc);
            infowindow.open(map,marker);
            activeWindow = infowindow;
            
        });
       // returns marker object so we can create another infowindow on listElemClick
       // I return as an array cause I'll need to put it in a array variable type later

        return([marker]);
        
    }
    
$(document).ready(function(){
    //initialise a map
    initMap();

    // alows us to get into the file, which is originally kml.kml but I renamed kml.xml
    // cause kml format is close to xml, and that's with this idea that we fetch it
    $.get(kmlURL, function(data){

        html = "";

        //loop through placemarks tags
        $(data).find("Placemark").each(function(index, value){
            //get coordinates and place name
            
            coords = $(this).find("coordinates").text();
            place = $(this).find("name").text();
            desc = $(this).find("description").text();
            stylurl = $(this).find("styleUrl").text();
            //store as JSON
            var c = coords.split(",")
            nav.push({
                "place": place,
                "lat": c[0],
                "lng": c[1],
                "desc":desc
            })
            //output as a navigation + identification of each line
            html += "<li id='"+ident+"' >" + place + "</li>";
            
            // did this because they were strings
            // and I think google.maps.LatLng can't use strings as parameters
            c[0] = parseFloat(c[0]);
            c[1] = parseFloat(c[1]);
            
            //building the content of our infowindows :)
            var MapsHPLink ='<a target="_blank" href="'+StartMPLINK+c[1]+','+c[0]+'">See on Maps</a>';
            var FinalDesc = '<h1 id="firstHeading" class="firstHeading">'+place+'</h1>'+desc+'<br />'+MapsHPLink;
            
            //creating google maps coordinates
            var latlng = new google.maps.LatLng(c[1],c[0]);

            //Our object store, ready with all infos to create a marker !
            var store = {
                place: place,
                latlng: latlng,
                desc: FinalDesc,
                ident: ident,
                stylurl: stylurl
            };

            // this is another object for InfoWindow ListElemClick purpose
            // couldn't use "store" :(
            storeA.push({
                "ContListDesc":FinalDesc
            });
           
            //there we send our "store" object to create a marker
            //with the right properties
            MarkANDInfoW = createMarker(store);
            
            //Here we kind of manage our markers by arranging them in an array
            //which position corresponds to the id of our list item
            ListLinkMarker[ident] = MarkANDInfoW[0];
            
            //we increase the id, so each list item can have its own id :)
            ident = ident + 1;

        })
        //add the list html code to the <ul> armed with navigation class :D
        $(".navigation").append(html);

        //bind clicks on your navigation to scroll to a placemark
        $(".navigation li").bind("click", function(){
            //check if previous infowindow is opened, and if yes close it
            if (activeWindow != null) {
                activeWindow.close();
            }
            if (activeWindowList != null) {
                activeWindowList.close();
            }

            //this is very cool (kanye)
            // it allows us to catch the id of the item we click on !
            var identclik = $(this).attr('id'); 

            //create new infowindow and fill it then open it
            // you see that we pick the right marker :) (might be useless lmao)
            var infowindow = new google.maps.InfoWindow({}); 
            infowindow.setContent(storeA[$(this).index()].ContListDesc);
            infowindow.open(map,ListLinkMarker[identclik]);

            activeWindowList = infowindow;

            //scroll to marker !
            panToPoint = new google.maps.LatLng(nav[$(this).index()].lng, nav[$(this).index()].lat);
            map.panTo(panToPoint);  
        })

    });   

    

})
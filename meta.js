// Used to generate meta file (for nodejs) and load meta files (for web).
//
"use strict";

if (this.DOMParser == undefined) {
  // in node.js
  var fs = require("fs");
}

// JS code used in both broswer and nodejs
(function(exports){
  exports.Meta = Meta;
}(typeof exports === 'undefined' ? this.meta = {} : exports));

// Global variable
//

// The list of default patients data. Each entry is a dict:
//
//   desc: The string shown to user
//   meta: The meta file path. It contains bounding box and last-updated info.
//   path: The point data path.
//   src: URL string pointing to the data source.
//
// This structure is used to indicate where data are located. They will be loaded to PATIENT somehow.
//
var DEFAULT_PATIENTS_DATA = [
  // Taiwan ChingMing Days
  {
    desc: 'Taiwan 台灣清明節高風險地區',
    meta: 'countries/taiwan/ChingMing-meta.json',
    path: 'countries/taiwan/ChingMing-output.json',
    src: 'https://drive.google.com/open?id=145ia8C6MEMaI_ZdeezWmF_q-M1beh6RP&usp=sharing',
  },

  // coronamap.site
  {
    desc: 'Korea data [https://coronamap.site]',
    meta: "countries/korea/coronamap.site-meta.json",
    path: "countries/korea/coronamap.site-output.json",
    src: 'https://coronamap.site',
  },

  // Israel government GIS
  {
    desc: 'Israel cases',
    meta: "countries/israel/meta.json",
    path: "countries/israel/output.json",
    src: 'https://imoh.maps.arcgis.com/apps/webappviewer/index.html?id=20ded58639ff4d47a2e2e36af464c36e&locale=he&/',
  },
];

// Class Meta
//
//  Used in nodejs to output meta file.
//
function Meta(out_file_path) {
  let out_file_path_ = out_file_path;
  let bounding_box_ = BoundingBox();
  let num_of_points_ = 0;

  return {
    insert_bounding_box: function(lat, lng) {
      bounding_box_.insert(lat, lng);
      num_of_points_ += 1;
    },

    output: function() {
      if (out_file_path_ === undefined) {
        console.error("Please specify meta file path");
        console.error(new Error().stack);
        return;
      }

      let meta_text = JSON.stringify({
        timestamp: (new Date()).getTime(),
        bounding_box: bounding_box_.get(),
        num_of_points: num_of_points_,
        // TODO: last_updated:
      }, null, 2);
      fs.writeFile(out_file_path_, meta_text, function (err) {
        if (err) throw err;
      });
    },
  };
}

// Class BoundingBox
//
//  Given lat/lng pairs, this class populates a bounding box that contains all points.
function BoundingBox() {
  let top = undefined;     // lat
  let left = undefined;    // lng
  let right = undefined;   // lng
  let bottom = undefined;  // lat

  return {
    insert: function(lat, lng) {
      if (top === undefined || lat > top) { top = lat; }
      if (bottom === undefined || lat < bottom) { bottom = lat; }
      if (right === undefined || lng > right) { right = lng; }
      if (left === undefined || lng < left) { left = lng; }
    },

    get: function() {
      return {
        top: top,
        left: left,
        right: right,
        bottom: bottom,
      };
    },
  };
};

function testBoundingBox() {
  let bb = BoundingBox();
  bb.insert(1, 2);
  bb.insert(-3, -4);
  EXPECT_EQ({
    top: 1,
    left: -4,
    right: 2,
    bottom: -3,
  }, bb.get());
}

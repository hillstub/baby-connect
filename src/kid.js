// Copyright (c) 2017 Marshall Roch <marshall@mroch.com>
// All rights reserved.
const moment = require('moment');

"use strict";

class Kid {
  constructor(request, parentID, name, id, gender) {
    this._request = request;
    this._parentID = parentID;
    this._name = name;
    this._id = id;
    this._gender = gender;
  }

  get name() { return this._name; }
  get id() { return this._id; }
  get gender() { return this._gender; }

  saveNursing(startTime, leftSideInMin, rightSideInMin, lastSide){
    leftSideInMin = Math.round(leftSideInMin);
    rightSideInMin = Math.round(rightSideInMin);
    var sumInMin = Math.round(leftSideInMin+rightSideInMin);
    var descStr;
    if(lastSide == 1){ // last side is left
      descStr = `${rightSideInMin}min right, ${leftSideInMin}min left`;
    }else {
      descStr = `${leftSideInMin}min left, ${rightSideInMin}min right`;  
    }
    var data = {l:[{
      Utm: startTime,
      Pdt: startTime,
      p: lastSide+";"+leftSideInMin+";"+rightSideInMin,
      d: sumInMin,
      Txt: `${this.name} nursed (${descStr})`,
      Cat: 350
    }]};

    return this._request.saveStatusNew(
      this._parentID,
      this._id,
      new Date(),
      data
    ).then(() => true);    
  }

  startSleeping(time) {
    this.getStatusList().then((status) =>{
      if(!status.summary.isSleeping){    
        return this.saveStatus(
          Kid.Category.SLEEP_START,
          `${this.name} started sleeping`,
          time
        );
      }
    });
  }

  stopSleeping(time) {
    this.getStatusList().then((status) =>{
      if(status.summary.isSleeping){
        //8/20/2017 16:24
        console.log("is sleeping");
        var beginTime = moment(status.summary.timeOfLastSleeping, "MM/DD/YYYY HH:mm");

        var endTime = moment(time).seconds(0).milliseconds(0);
        var duration = moment.duration(endTime.diff(beginTime)).asMinutes();
        var minuteDiff = endTime.diff(beginTime,'minutes');
        var hourDuration = Math.floor(minuteDiff/60);
        var minuteDuration = minuteDiff % 60;
        console.log(duration);
        return this.saveStatus(
          Kid.Category.SLEEP,
          `${this.name} slept (`+hourDuration+'h and '+minuteDuration+'min)',
          beginTime,
          endTime
        );
      } 
    });
    
    return true;
 /*   return this.saveStatus(
      Kid.Category.SLEEP_STOP,
      `${this.name} stopped sleeping`,
      time
    );*/
  }

  dirtyDiaper(time, size) {
    let sizeStr = size ? ` (${size})` : '';
    return this.saveStatus(
      Kid.Category.DIAPER_BM,
      `${this.name} had a BM diaper${sizeStr}`,
      time
    );
  }

  wetDiaper(time, size) {
    let sizeStr = size ? ` (${size})` : '';
    return this.saveStatus(
      Kid.Category.DIAPER_WET,
      `${this.name} had a wet diaper${sizeStr}`,
      time
    );
  }

  dirtyAndWetDiaper(time, size) {
    let sizeStr = size ? ` (${size})` : '';
    return this.saveStatus(
      Kid.Category.DIAPER_BM_WET,
      `${this.name} had a BM and wet diaper${sizeStr}`,
      time
    );
  }

  dryDiaper(time) {
    return this.saveStatus(
      Kid.Category.DIAPER_DRY,
      `${this.name} had a dry diaper`,
      time
    );
  }

  getStatusList(){
    return this._request.getStatusList(
      this._parentID,
      this._id,
      new Date()
    );
  }

  saveStatus(category, text, time, object) {
    return this._request.saveStatus(
      this._parentID,
      this._id,
      category,
      text,
      time,
      object
    ).then(() => true);
  }
}

Kid.Category = {
  STARTSTOP: 100,
  DROPOFF: 101,
  PICKUP: 102,
  CHANGEROOM: 106,
  EATING: 200,
  BIB: 300,
  NURSING: 350,
  NURSING_L: 352,
  NURSING_R: 354,
  NURSING_COUNT: 5,
  DIAPER_BM: 401,
  DIAPER_BM_WET: 402,
  DIAPER_WET: 403,
  DIAPER_DRY: 404,
  SLEEP: 500,
  SLEEP_START: 501,
  SLEEP_STOP: 502,
  MOOD: 600,
  ACTIVITIES: 700,
  TEMPERATURE: 800,
  LOCATION: 900,
  PHOTO: 1000,
  MESSAGE: 1100,
  CALL: 1200,
  MILESTONE: 1300,
  SICKNESS: 1400,
  MEDICINE: 1500,
  VACCINE: 1600,
  WEIGHT: 1700,
  HEIGHT: 1800,
  HEADSIZE: 1900,
  DOCTORVISIT: 2000,
  DOCTORQUESTION: 2100,
  PUMPING: 2200,
  POTTY: 2500,
  DIARY: 2600,
  CUP: 2700,
  DOCUMENT: 2800,
  MEDICAL: 2300,
  FEED: 2400,
  INCIDENT: 2900,
  NEED: 3000,
  BEHAVIOR: 3100,
  ASSESSMENT: 3200
}

Kid.BOY = 'boy';
Kid.GIRL = 'girl';

module.exports = Kid;

/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

// Wait for the deviceready event before using any of Cordova's device APIs.
// See https://cordova.apache.org/docs/en/latest/cordova/events/events.html#deviceready
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}

function warningEmptyFill() {
    alert('Please fill in activity name, date and reporter name');
}

function warningDuplicate() {
    alert('Activity is existed');
}

function addActivityToDatabase(activity, location, date, time, reporter) {
    var curDate = new Date();
    var indexTime = curDate.getTime();

    var db = window.sqlitePlugin.openDatabase({name: 'activities.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('CREATE TABLE IF NOT EXISTS ActivityTable (id, activity, location, date, time, note, reporter, image)');
        tr.executeSql('INSERT INTO ActivityTable VALUES (?1,?2,?3,?4,?5,?6,?7,?8)', [indexTime, activity, location, date, time, "", reporter, ""]);
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        window.location.href='home.html'
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function readActivityListFromStorage() {
    await sleep(500);
    readDatabaseActivity()
}



function deleteActivityById (id) {
    event.stopPropagation();
    var db = window.sqlitePlugin.openDatabase({name: 'activities.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('DELETE FROM ActivityTable WHERE id LIKE '+ id, [], function(tx, results) {
    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        readDatabaseActivity();
    });
}

function onEditClick(id, name, location, date, time, note, reporter) {
    event.stopPropagation();
    window.location.href='edit.html?id='+id+'&name='+ name + '&location='+ location + '&date='+ date + '&time='+ time + '&note='+ note + '&reporter=' + reporter;
}


function readDatabaseActivity() {
    var activities = [];
    var db = window.sqlitePlugin.openDatabase({name: 'activities.db', location: 'default'});
    db.transaction(function(tr) {
    tr.executeSql("SELECT * FROM ActivityTable", [], function(tx, results) {
        var i;
        for(i = 0; i < results.rows.length ; i++) {
            var activity = {
                id : results.rows.item(i).id,
                name : results.rows.item(i).activity,
                location : results.rows.item(i).location,
                date : results.rows.item(i).date,
                time : results.rows.item(i).time,
                note : results.rows.item(i).note,
                reporter : results.rows.item(i).reporter,
            };
			console.log('Read database OK 123: ' + activity.name);
			console.log('Read database OK 123: ' + activity.location);
			console.log('Read database OK 123: ' + activity.date);
			console.log('Read database OK 123: ' + activity.time);
			console.log('Read database OK 123: ' + activity.reporter);
			
            activities.push(activity);
        }

        document.getElementById('list_rent').innerHTML = activities.map(item =>
            `<div class="activity" onclick="window.location.href='details.html?id=${item.id}'">
                <span class="date">${item.date}</span>
                <p class="activity_name">${item.name}</p>
                <p class="reporter">${item.reporter}</p>
                <div class="group_btn">
                    <button class="delete_btn" id="btn_delete_item" onclick="event.stopPropagation(); deleteActivityById(${item.id})">DELETE</button>
                    <button class="edit_btn" id="btn_edit_item" onclick="event.stopPropagation(); onEditClick('${item.id}','${item.name}','${item.location}','${item.date}','${item.time}','${item.note}','${item.reporter}')">EDIT</button>
                </div>
            </div>`
        ).join('');

    });
    }, function(error) {
        console.log('Transaction ERROR: 123' + error.message);
    }, function() {
        console.log('Read database OK');
    });
}

function updateActivity(id, name, location, date, time, reporter) {
    var db = window.sqlitePlugin.openDatabase({name: 'activities.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('UPDATE ActivityTable SET activity = ?, location = ?, date = ?, time = ?, reporter = ?  WHERE id = '+ id, [name, location, date, time, reporter], function(tx, results) {
    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        window.location.href='home.html';
    });
}

async function readActivityDetailFromDatabase(id) {
    await sleep(500);
    readDatabaseDetailActivity(id)
}

function readDatabaseDetailActivity(id) {
    var db = window.sqlitePlugin.openDatabase({name: 'activities.db', location: 'default'});
    db.transaction(function(tr) {
    tr.executeSql('SELECT * FROM ActivityTable WHERE id LIKE ' + id, [], function(tx, results) {
        if(results.rows.item(0).image === '') {

        } else {
            document.getElementById("image_property").src = "data:image/jpeg;base64," +  results.rows.item(0).image;
        }
        document.getElementById("activity").innerHTML = results.rows.item(0).activity;
        document.getElementById("location").innerHTML = results.rows.item(0).location;
        document.getElementById("date").innerHTML = results.rows.item(0).date;
        document.getElementById("time").innerHTML = results.rows.item(0).time;

        document.getElementById("reporter").innerHTML = results.rows.item(0).reporter;
        if(results.rows.item(0).note === '') {
            document.getElementById("note").innerHTML = 'Add note!';
        } else {
            document.getElementById("note").innerHTML = "'" + results.rows.item(0).note + "'";
        }
    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        console.log('Read database OK');
    });
}

function searchByName(keyword) {
    var activities = [];
    var db = window.sqlitePlugin.openDatabase({name: 'activities.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('SELECT * FROM ActivityTable WHERE activity LIKE \'' + keyword + '\'', [], function(tx, results) {
            var i;
            for(i = 0; i < results.rows.length ; i++) {
                var activity = {
					id : results.rows.item(i).id,
					name : results.rows.item(i).activity,
					location : results.rows.item(i).location,
					date : results.rows.item(i).date,
					time : results.rows.item(i).time,
					note : results.rows.item(i).note,
					reporter : results.rows.item(i).reporter,
				};
                activities.push(activity);
            }
            document.getElementById('list_rent').innerHTML = activities.map(item =>
				`<div class="activity" onclick="window.location.href='details.html?id=${item.id}'">
					<span class="date">${item.date}</span>
					<p class="activity_name">${item.name}</p>
					<p class="reporter">${item.reporter}</p>
					<div class="group_btn">
						<button class="delete_btn" id="btn_delete_item" onclick="event.stopPropagation(); deleteActivityById(${item.id})">DELETE</button>
						<button class="edit_btn" id="btn_edit_item" onclick="event.stopPropagation(); onEditClick('${item.id}','${item.name}','${item.location}','${item.date}','${item.time}','${item.note}','${item.reporter}')">EDIT</button>
					</div>
				</div>`
			).join('');
        });
        }, function(error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function() {
            console.log('Read database OK');
        }
    );
}

function checkDuplicate(activity, location, date, time, reporter) {
    var db = window.sqlitePlugin.openDatabase({name: 'activities.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('SELECT * FROM ActivityTable WHERE activity LIKE \'' + activity + '\'', [], function(tx, results) {
            var i;
			var rs = 0;
            for(i = 0; i < results.rows.length ; i++) {
				if (activity == results.rows.item(i).activity && location == results.rows.item(i).location && date == results.rows.item(i).date && time == results.rows.item(i).time && reporter == results.rows.item(i).reporter) {
					warningDuplicate()
					return true;
				}
            }
        });
        }, function(error) {
            console.log('Transaction ERROR: ' + error.message);
			return true;
        }, function() {
            console.log('Read database OK');
			return true;
        }
    );
}

function addNoteToActivityById(id, note) {
    var db = window.sqlitePlugin.openDatabase({name: 'activities.db', location: 'default'});
    db.transaction(function(tr) {
        tr.executeSql('UPDATE ActivityTable SET note = ?  WHERE id = '+ id, [note], function(tx, results) {
    });
    }, function(error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function() {
        document.getElementById("addNoteContainer").style.display = "none";
        document.getElementById("showDetails").style.display = "block";
        readDatabaseDetailActivity(id);
    });
}

function onPickPhoto(id) {
    navigator.camera.getPicture(onPickImageSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
     });
  
     function onPickImageSuccess(imageURL) {
        var db = window.sqlitePlugin.openDatabase({name: 'activities.db', location: 'default'});
        db.transaction(function(tr) {
            tr.executeSql('UPDATE ActivityTable SET image = ?  WHERE id = '+ id, [imageURL], function(tx, results) {
        });
        }, function(error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function() {
            var image = document.getElementById('image_property');
            image.src = "data:image/jpeg;base64," + imageURL;
        });
     }
  
     function onFail(message) {
     }
}


var NMData;

var main = (function() {

	var ImportNMList;

	/**
	* LocalStrageからNMデータを読み込む
	* データが無ければ、初期値を設定する
	*/
	function loadData() {
		var NMDataJson = localStorage.getItem('NMData_Pyros');
		var importNMListJson = localStorage.getItem('NMList_Pyros');
		var version = localStorage.getItem('Version_Pyros');
		//データがない場合初期値設定
		if(NMDataJson == null || importNMListJson == null) {
			main.resetData(false);
			loadData();
			return;
		}
		if(version < $('#version').text()) {
			$('#oldMsg').css('display','inline');
		}
		NMData = JSON.parse(NMDataJson);
		ImportNMList = JSON.parse(importNMListJson);
		$('#NMData').val(NMDataJson);
		$('#ImportNMList').val(importNMListJson);
	}

	/**
	* NMテーブルを作成する
	*/
	function makeTable() {
		var i = 0;
		$('#NMTable tbody tr').each(function(){
			var cells = $(this).children();
			//NMが無いデータは行を非表示にする
			if(NMData[i][1] == '') {
				$(cells[1]).parent().css('display','none');
			} else {
				$(cells[0]).text(NMData[i][0]);
				$(cells[1]).text(NMData[i][1]);
				$(cells[4]).text(NMData[i][2]);
				$(cells[5]).text(NMData[i][3]);
				$(cells[6]).text(NMData[i][4]);
			}
			i++;
		});
	}

	/**
	* 天気情報をプルダウンに設定
	*/
	function setWeatherData() {
		var weathers = WeatherFinder.weatherLists['Pagos'];
		var selects = $("#HopeWeather").add("#BeforeWeather");
		for (var w in weathers) {
			selects.append('<option value="' + weathers[w].id + '">' + WeatherFinder.getWeatherName(weathers[w].id) + '</option>');
		}
	}

	var global = {

		/**
		 * ページの初期処理
		 */
		init: function() {
			loadData();
			makeTable();
			setWeatherData();
			time.init();
			map.setMap();
			time.times();
			time.result();
		},

		/**
		 * シャウトテキストの取り込み
		 */
		importText: function(){
			var text = $('#importText').val();
			//時間を設定
			for (var i = 0; i < ImportNMList.length; i++) {
					try {
						var pattern = new RegExp(ImportNMList[i][0],'i');
						var result = text.match(pattern);
						result[0] = '';
						var time = result.join('');
						if (time.search(/^[0-9]+$/) == 0){
								//取得した時間が数値の場合、時間を設定
								$('#' + ImportNMList[i][1]).val(time);
						}
					} catch (e) {
							console.log(pattern);
							console.log(e);
					}
				}
		},

		/**
		 * 時間を初期化する
		 */
		clearTime: function(){
			for (var i = 0; i < 20; i++) {
				$("#NM"+('00'+i).slice(-2)).val("");
			}
			time.result();
		},

		/**
		 * 現在時刻を入力する
		 */
		pressNow: function(No){
			var jikan = new Date();
			var hour =('00'+jikan.getHours()).slice(-2);
			var minute =('00'+jikan.getMinutes()).slice(-2);
			var now = parseInt("" + hour + minute,10);
			$("#NM" + ('00'+No).slice(-2) ).val(now);
			time.result();
		},

		/**
		 * シャウト文をコピーする
		 */
		copyText: function(){
			$('#result').select();
			document.execCommand("copy");
		},

		/**
		* データをLocalStrageに設定する
		*/
		saveData: function() {
			var tempNMData;
			var tempNMList;
			var NMDataJson = $('#NMData').val();
			var importNMListJson = $('#ImportNMList').val();
			//NMDataの形式チェック
			try{
				tempNMData = JSON.parse(NMDataJson);
				for (var i = 0; i < tempNMData.length; i++) {
					if(tempNMData[i].length != 10){
						alert($('#errorMsg1').text().replace('$',i+1)	);
						return;
					}
					if(isNaN(tempNMData[i][5])){
						alert($('#errorMsg2').text().replace('$',i+1));
						return;
					}
					if(isNaN(tempNMData[i][6])){
						alert($('#errorMsg3').text().replace('$',i+1));
						return;
					}
				}
			} catch(e) {
				alert($('#errorMsg6').text().replace('$',i+1));
				console.log(e);
				return;
			}
			//NMListの形式チェック
			try{
				var regex = new RegExp(/NM0[1-9]|1[0-9]|20/);
				tempNMList = JSON.parse(importNMListJson);
				for (var i = 0; i < tempNMList.length; i++) {
					if(tempNMList[i].length != 2){
						alert($('#errorMsg4').text().replace('$',i+1));
						return;
					}
					if(!tempNMList[i][1].match(regex)){
						alert($('#errorMsg5').text().replace('$',i+1));
						return;
					}
				}
			} catch(e) {
				alert($('#errorMsg6').text().replace('$',i+1));
				console.log(e);
				return;
			}
			localStorage.setItem('NMData_Pyros', NMDataJson);
			localStorage.setItem('NMList_Pyros', importNMListJson);
			alert($('#successMsg1').text());
		},

		/**
		* LocalStrageのデータを初期化する
		* @param {msgFlag} 成功メッセージを表示する(true:表示する、false:表示しない)
		*/
		resetData: function(msgFlag) {
			var tempNMData;
			var tempNMList;
			//	 EL,	NM,						Triger,					Lv,	Remarks,	x,	y,	shout1,				shout2,			shout3
			tempNMData=[
				['35',	'白き叫声「レウコシアー」',			'ピューロス・ブフート',			'39',	'',		'27.2',	'26.0',	'[1]レウコシア',		'①レウコシア',		'レウコシア'	],
				['36',	'獰猛なる雷獣「フラウロス」',			'サンダーストームスプライト',		'41',	'雷',		'28.9',	'29.4',	'[2]フラウロス',		'②フラウロス',		'フラウロス'	],
				['37',	'妖異の弁論家「ソフィスト」',			'ピューロス・アパンダ',			'42',	'',		'32',	'31',	'[3]ソフィスト',		'③ソフィスト',		'ソフィスト'	],
				['38',	'恐怖の人形「グラッフアカーネ」',		'バル・バイキング',			'42',	'',		'23.0',	'37.2',	'[4]グラッフアカーネ',		'④グラッフ',		'グラッフ'	],
				['39',	'書の守護者「アスカラポス」',			'グブラトーム',				'44',	'',		'18',	'29',	'[5]アスカラポス',		'⑤アスカラポス',	'アスカラポス'	],
				['40',	'深淵の大公「グランドデューク・バティム」',	'ダーク・トルバドゥール',		'45',	'',		'17',	'15',	'[6]グランドデューク・バティム','⑥バティム',		'ティム'	],
				['41',	'???',						'???',					'??',	'',		'99',	'99',	'[7]???',			'⑦???',		'???'		],
				['42',	'???',						'???',					'??',	'',		'99',	'99',	'[8]???',			'⑧???',		'???'		],
				['43',	'???',						'???',					'??',	'',		'99',	'99',	'[9]???',			'⑨???',		'???'		],
				['44',	'???',						'???',					'??',	'',		'99',	'99',	'[10]???',			'⑩???',		'???'		],
				['45',	'???',						'???',					'??',	'',		'99',	'99',	'[11]???',			'⑪???',		'???'		],
				['46',	'???',						'???',					'??',	'',		'99',	'99',	'[12]???',			'⑫???',		'???'		],
				['47',	'???',						'???',					'??',	'',		'99',	'99',	'[13]???',			'⑬???',		'???'		],
				['48',	'???',						'???',					'??',	'',		'99',	'99',	'[14]???',			'⑭???',		'???'		],
				['49',	'???',						'???',					'??',	'',		'99',	'99',	'[15]???',			'⑮???',		'???'		],
				['50',	'???',						'???',					'??',	'',		'99',	'99',	'[16]???',			'⑯???',		'???'		],
				['',	'',						'',					'',	'',		'99',	'99',	'',				'',			''		],
				['',	'',						'',					'',	'',		'99',	'99',	'',				'',			''		],
				['',	'',						'',					'',	'',		'99',	'99',	'',				'',			''		],
				['',	'',						'',					'',	'',		'99',	'99',	'',				'',			''		],
				['',	'',						'',					'',	'',		'99',	'99',	'',				'',			''		]
			];

			tempNMList = [
				['レウコシア\\[(..):(..)\\]','NM01'],['フラウロス\\[(..):(..)\\]','NM02'],['ソフィスト\\[(..):(..)\\]','NM03'],['グラッフアカーネ\\[(..):(..)\\]','NM04'],['アスカラポス\\[(..):(..)\\]','NM05'],['グランドデューク・バティム\\[(..):(..)\\]','NM06'],['？？？\\[(..):(..)\\]','NM07'],['？？？\\[(..):(..)\\]','NM08'],['？？？\\[(..):(..)\\]','NM09'],['？？？\\[(..):(..)\\]','NM10'],['？？？\\[(..):(..)\\]','NM11'],['？？？\\[(..):(..)\\]','NM12'],['？？？\\[(..):(..)\\]','NM13'],['？？？\\[(..):(..)\\]','NM14'],['？？？\\[(..):(..)\\]','NM15'],['？？？\\[(..):(..)\\]','NM16'],['？？？\\[(..):(..)\\]','NM17'],
				['レウコシア:(..):(..)','NM01'],['フラウロス:(..):(..)','NM02'],['ソフィスト:(..):(..)','NM03'],['グラッフ:(..):(..)','NM04'],['アスカラポス:(..):(..)','NM05'],['バティム:(..):(..)','NM06'],['キングイグルー:(..):(..)','NM07'],['？？？:(..):(..)','NM08'],['？？？:(..):(..)','NM09'],['？？？:(..):(..)','NM10'],['？？？:(..):(..)','NM11'],['？？？:(..):(..)','NM12'],['？？？:(..):(..)','NM13'],['？？？:(..):(..)','NM14'],['？？？:(..):(..)','NM15'],['？？？:(..):(..)','NM16'],['？？？:(..):(..)','NM17']
			];
			localStorage.setItem('NMData_Pyros', JSON.stringify(tempNMData));
			localStorage.setItem('NMList_Pyros', JSON.stringify(tempNMList));
			localStorage.setItem('Version_Pyros', $('#version').text());
			if(msgFlag) {
				alert($('#successMsg2').text());
			}
		},

		/**
		* シャウト文変更チェックボックスの表示を切り替える
		* @param {viewFlag} シャウト文変更チェックボックスを表示する(true:表示する、false:表示しない)
		*/
		viewChangeShout: function(viewFlag) {
			if(viewFlag) {
				$('#ChangeShout').removeClass('viewChangeShoutFalse');
				$('#ChangeShout').addClass('viewChangeShoutTrue');
			} else {
				$('#ChangeShout').removeClass('viewChangeShoutTrue');
				$('#ChangeShout').addClass('viewChangeShoutFalse');
			}
		},

		/**
		* 天気を検索する
		*/
		searchWeather: function() {
			$("#watherResult").html('');
			var weatherStartTime = WeatherFinder.getWeatherTimeFloor(new Date()).getTime();
			var weatherStartHour = WeatherFinder.getEorzeaHour(weatherStartTime);
			var zone = 'Pagos';
			var targetWeather = $("#HopeWeather").val();
			var targetPrevWeather = $("#BeforeWeather").val();
			var tries = 0;
			var matches = 0;
			var weather = WeatherFinder.getWeather(weatherStartTime, zone);
			var prevWeather = WeatherFinder.getWeather(weatherStartTime-1, zone);
			while (tries < 1000 && matches < 3) {
				var weatherMatch = targetWeather == null;
				var prevWeatherMatch = targetPrevWeather == null;
				if (targetWeather == "" || targetWeather == weather.id) {
					weatherMatch = true;
				}
				if (targetPrevWeather == "" || targetPrevWeather == prevWeather.id) {
					prevWeatherMatch = true;
				}
				if (weatherMatch && prevWeatherMatch) {
					var weatherDate = new Date(weatherStartTime).toLocaleString();
					$("#watherResult").append('<tr><td>' + weatherStartHour + ':00</td><td>' + weatherDate + '</td></tr>');
					matches++;
				}
				weatherStartTime += 8 * 175 * 1000; // Increment by 8 Eorzean hours
				weatherStartHour = WeatherFinder.getEorzeaHour(weatherStartTime);
				prevWeather = weather;
				weather = WeatherFinder.getWeather(weatherStartTime, zone);
				tries++;
			}

			//検索該当無し
			if (matches == 0) {
				$("#watherResult").append('<td colspan="2">' + $('#noResultMsg').text() + '</td>');
			}
		}
	};
	return global;
})();

// ページ読み込み完了と同時に初期処理を実行する
$(window).on('load', main.init);
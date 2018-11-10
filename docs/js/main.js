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
		var weathers = WeatherFinder.weatherLists['Pyros'];
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
				['35',	'白き叫声「レウコシアー」',			'ピューロス・ブフート',			'39',	'ET19:00～5:59','27.2',	'26.0',	'[1]レウコシア',		'①レウコシア',		'レウコシア'	],
				['36',	'獰猛なる雷獣「フラウロス」',			'サンダーストームスプライト',		'41',	'雷',		'28.9',	'29.4',	'[2]フラウロス',		'②フラウロス',		'フラウロス'	],
				['37',	'妖異の弁論家「ソフィスト」',			'ピューロス・アパンダ',			'42',	'',		'32',	'31',	'[3]ソフィスト',		'③ソフィスト',		'ソフィスト'	],
				['38',	'恐怖の人形「グラッフアカーネ」',		'バル・バイキング',			'42',	'',		'23.0',	'37.2',	'[4]グラッフアカーネ',		'④グラッフ',		'アカーネ'	],
				['39',	'書の守護者「アスカラポス」',			'グブラトーム',				'44',	'霊風',		'19.2',	'29.2',	'[5]アスカラポス',		'⑤アスカラポス',	'アスカラ'	],
				['40',	'深淵の大公「グランドデューク・バティム」',	'ダーク・トルバドゥール',		'45',	'ET19:00～5:59','17.8',	'14.0',	'[6]グランドデューク・バティム','⑥バティム',		'バティム'	],
				['41',	'稲妻の指揮者「アイトロス」',			'バル・アインハンダー',			'46',	'',		'10',	'14',	'[7]アイトロス',		'⑦アイトロス',		'アイトロス'	],
				['42',	'灼熱の突剣「レサト」',				'バードイーター',			'47',	'',		'12',	'11',	'[8]レサト',			'⑧レサト',		'レサト'	],
				['43',	'炎熱の巨人「エルドスルス」',			'ピューロスクラブ',			'48',	'',		'15.2',	'6.4',	'[9]エルドスルス',		'⑨エルドスルス',	'エルドス'	],
				['44',	'落涙の海燕「イリス」',				'ノーザンスワロー',			'49',	'',		'21.3',	'12.2',	'[10]イリス',			'⑩イリス',		'イリス'	],
				['45',	'奇跡の生還者「傭兵のレイムプリクス」',		'ブルーハンド・エスケーピー',		'50',	'',		'21',	'8',	'[11]レイムプリクス',		'⑪レイムプリクス',	'レイム'	],
				['46',	'電影将軍「ライトニング・ドゥクス」',		'マタンガ',				'51',	'雷',		'29',	'8',	'[12]ドゥクス',			'⑫ドゥクス',		'ドゥクス'	],
				['47',	'ランバージャック・デスマッチ',			'ピューロス・トレント',			'52',	'',		'30',	'10',	'[13]ランバージャック',		'⑬ランバージャック',	'ジャック'	],
				['48',	'知恵と戦の母「グラウコピス」',			'バル・スカネテ',			'53',	'',		'32',	'15',	'[14]グラウコピス',		'⑭グラウコピス',	'グラウコ'	],
				['49',	'相反する双子「イン・ヤン」',			'ピューロス・ヘクトアイズ',		'54',	'',		'11.4',	'34.2',	'[15]イン・ヤン',		'⑮イン・ヤン',		'インヤン'	],
				['50',	'嘲りの月狼「スコル」',				'ピューロス・シャック',			'55',	'吹雪',		'24',	'29',	'[16]スコル',			'⑯スコル',		'スコル'	],
				['50',	'炎蝶の女王「ペンテシレイア」',			'バル・ブラッドグライダー',		'55',	'灼熱',		'35',	'6',	'[17]ペンテシレイア',		'⑰ペンテシレイア',	'レイア'	],
				['',	'',						'',					'',	'',		'99',	'99',	'',				'',			''		],
				['',	'',						'',					'',	'',		'99',	'99',	'',				'',			''		],
				['',	'',						'',					'',	'',		'99',	'99',	'',				'',			''		],
				['',	'',						'',					'',	'',		'99',	'99',	'',				'',			''		]
			];

			tempNMList = [
				['レウコシア\\[(..):(..)\\]','NM01'],['フラウロス\\[(..):(..)\\]','NM02'],['ソフィスト\\[(..):(..)\\]','NM03'],['グラッフアカーネ\\[(..):(..)\\]','NM04'],['アスカラポス\\[(..):(..)\\]','NM05'],['グランドデューク・バティム\\[(..):(..)\\]','NM06'],['アイトロス\\[(..):(..)\\]','NM07'],['レサト\\[(..):(..)\\]','NM08'],['エルドスルス\\[(..):(..)\\]','NM09'],['イリス\\[(..):(..)\\]','NM10'],['レイムプリクス\\[(..):(..)\\]','NM11'],['ドゥクス\\[(..):(..)\\]','NM12'],['ランバージャック\\[(..):(..)\\]','NM13'],['グラウコピス\\[(..):(..)\\]','NM14'],['イン・ヤン\\[(..):(..)\\]','NM15'],['スコル\\[(..):(..)\\]','NM16'],['ペンテシレイア\\[(..):(..)\\]','NM17'],
				['レウコシア:(..):(..)','NM01'],['フラウロス:(..):(..)','NM02'],['ソフィスト:(..):(..)','NM03'],['グラッフ:(..):(..)','NM04'],['アスカラポス:(..):(..)','NM05'],['バティム:(..):(..)','NM06'],['アイトロス:(..):(..)','NM07'],['レサト:(..):(..)','NM08'],['エルドスルス:(..):(..)','NM09'],['イリス:(..):(..)','NM10'],['レイムプリクス:(..):(..)','NM11'],['ドゥクス:(..):(..)','NM12'],['ランバージャック:(..):(..)','NM13'],['グラウコピス:(..):(..)','NM14'],['イン・ヤン:(..):(..)','NM15'],['スコル:(..):(..)','NM16'],['ペンテシレイア:(..):(..)','NM17'],
				['グラッフ\\[(..):(..)\\]','NM04'],['バティム\\[(..):(..)\\]','NM06'],['アスカラ\\[(..):(..)\\]','NM05'],['エルドス\\[(..):(..)\\]','NM09'],['レイム\\[(..):(..)\\]','NM11'],['ジャック\\[(..):(..)\\]','NM13'],['グラウコ\\[(..):(..)\\]','NM14'],['インヤン\\[(..):(..)\\]','NM15'],['ペンテ\\[(..):(..)\\]','NM17'],['レイア\\[(..):(..)\\]','NM17'],['アカーネ\\[(..):(..)\\]','NM04'],['アカネ\\[(..):(..)\\]','NM04'],['人形\\[(..):(..)\\]','NM04'],['フクロウ\\[(..):(..)\\]','NM05']
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
			var zone = 'Pyros';
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

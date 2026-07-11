// รูปแลนด์มาร์กประเทศ/เมือง (Wikimedia Special:FilePath — sized+เสถียร)
// เมืองที่ไม่มี → fallback รูปประเทศ · ประเทศที่ไม่มี → ธง

const COUNTRY_IMG = {
  "JP": "https://commons.wikimedia.org/wiki/Special:FilePath/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg?width=640",
  "CN": "https://commons.wikimedia.org/wiki/Special:FilePath/The_Great_Wall_of_China_at_Jinshanling-edit.jpg?width=640",
  "KR": "https://commons.wikimedia.org/wiki/Special:FilePath/%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg?width=640",
  "TW": "https://commons.wikimedia.org/wiki/Special:FilePath/Jiuqudong_2003-01.jpg?width=640",
  "HK": "https://commons.wikimedia.org/wiki/Special:FilePath/Hong_Kong_Skyline_viewed_from_Victoria_Peak.jpg?width=640",
  "VN": "https://commons.wikimedia.org/wiki/Special:FilePath/Ha_Long_Bay_in_2019.jpg?width=640",
  "SG": "https://commons.wikimedia.org/wiki/Special:FilePath/Marina_Bay_Sands_%28I%29.jpg?width=640",
  "MM": "https://commons.wikimedia.org/wiki/Special:FilePath/Shwedagon_Pagoda_2017.jpg?width=640",
  "IN": "https://commons.wikimedia.org/wiki/Special:FilePath/Taj_Mahal_%28Edited%29.jpeg?width=640",
  "KZ": "https://commons.wikimedia.org/wiki/Special:FilePath/Astana_Esil_view.jpg?width=640",
  "TR": "https://commons.wikimedia.org/wiki/Special:FilePath/Hagia_Sophia_%28228968325%29.jpeg?width=640",
  "GE": "https://commons.wikimedia.org/wiki/Special:FilePath/View_of_Tbilisi_from_Tabori_Church_2023-10-08-2.jpg?width=640",
  "EG": "https://commons.wikimedia.org/wiki/Special:FilePath/Pyramids_of_the_Giza_Necropolis.jpg?width=640",
  "FR": "https://commons.wikimedia.org/wiki/Special:FilePath/La_Tour_Eiffel_vue_de_la_Tour_Saint-Jacques%2C_Paris_ao%C3%BBt_2014_%282%29.jpg?width=640",
  "IT": "https://commons.wikimedia.org/wiki/Special:FilePath/Colosseo_2020.jpg?width=640",
  "GB": "https://commons.wikimedia.org/wiki/Special:FilePath/Elizabeth_Tower%2C_June_2022.jpg?width=640",
  "EU": "https://commons.wikimedia.org/wiki/Special:FilePath/Prague_%286365119737%29.jpg?width=640",
  "AE": "https://commons.wikimedia.org/wiki/Special:FilePath/Burj_Khalifa_%28worlds_tallest_building%29_and_the_Dubai_skyline_%2825781049892%29.jpg?width=640"
};

const CITY_IMG = {
  "เฉิงตู": "https://commons.wikimedia.org/wiki/Special:FilePath/%E9%9B%AA%E5%B1%B1%E4%B8%8B%E7%9A%84%E6%88%90%E9%83%BD%E5%B8%82%E5%A4%A9%E9%99%85%E7%BA%BF_Chengdu_skyline_with_snow_capped_mountains.jpg?width=640",
  "เซี่ยงไฮ้": "https://commons.wikimedia.org/wiki/Special:FilePath/Huangpu_Park_20124-Shanghai_%2832208802494%29.jpg?width=640",
  "ฉงชิ่ง": "https://commons.wikimedia.org/wiki/Special:FilePath/Chongqing_Nightscape.jpg?width=640",
  "ชิงเต่า": "https://commons.wikimedia.org/wiki/Special:FilePath/Qingdao_Harbour_51341-Qingdao_%2849055637186%29.jpg?width=640",
  "ปักกิ่ง": "https://commons.wikimedia.org/wiki/Special:FilePath/Skyline_of_Beijing_CBD_with_B-5906_approaching_%2820211016171955%29_%281%29.jpg?width=640",
  "จางเจียเจี้ย": "https://commons.wikimedia.org/wiki/Special:FilePath/1_tianzishan_wulingyuan_zhangjiajie_2012.jpg?width=640",
  "คุนหมิง": "https://commons.wikimedia.org/wiki/Special:FilePath/%E4%BA%94%E5%8D%8E%E5%8C%BA%E4%B8%8E%E7%9B%98%E9%BE%99%E5%8C%BA%E5%A4%A9%E9%99%85%E7%BA%BF_-_%E8%88%AA%E6%8B%8D_-_2025-05-16_03.jpg?width=640",
  "จิ่วจ้ายโกว": "https://commons.wikimedia.org/wiki/Special:FilePath/1_jiuzhaigou_valley_wu_hua_hai_2011b.jpg?width=640",
  "ซินเจียง": "https://commons.wikimedia.org/wiki/Special:FilePath/Urumqi_Skyline_July_2019.jpg?width=640",
  "ซีอาน": "https://commons.wikimedia.org/wiki/Special:FilePath/51714-Terracota-Army.jpg?width=640",
  "ลี่เจียง": "https://commons.wikimedia.org/wiki/Special:FilePath/Lijiang_-_panoramio_%286%29.jpg?width=640",
  "ฮาร์บิน": "https://commons.wikimedia.org/wiki/Special:FilePath/West_facade_of_St._Sophia_Cathedral%2C_Harbin_%2820230721150450%29.jpg?width=640",
  "แชงกรีล่า": "https://commons.wikimedia.org/wiki/Special:FilePath/%E6%9D%BE%E8%B5%9E%E6%9E%97%E5%AF%BA_-_%E5%85%A8%E6%99%AF_-_2025-05-07_09_%28cropped%29.jpg?width=640",
  "กวางโจว": "https://commons.wikimedia.org/wiki/Special:FilePath/Canton_Tower_20241027_%28cropped%29.jpg?width=640",
  "ซูโจว": "https://commons.wikimedia.org/wiki/Special:FilePath/%E4%B8%9C%E6%96%B9%E4%B9%8B%E9%97%A81.jpg?width=640",
  "หางโจว": "https://commons.wikimedia.org/wiki/Special:FilePath/West_Lake%2C_Hangzhou_2025.jpg?width=640",
  "ฉางซา": "https://commons.wikimedia.org/wiki/Special:FilePath/%E7%88%B1%E6%99%9A%E4%BA%AD%EF%BC%88%E7%A7%8B-%E4%BE%A7%E9%9D%A2%EF%BC%89.jpg?width=640",
  "โตเกียว": "https://commons.wikimedia.org/wiki/Special:FilePath/Skyscrapers_of_Shinjuku_2009_January.jpg?width=640",
  "โอซาก้า": "https://commons.wikimedia.org/wiki/Special:FilePath/Osaka_Castle_03bs3200.jpg?width=640",
  "ฟูจิ": "https://commons.wikimedia.org/wiki/Special:FilePath/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg?width=640",
  "ฮอกไกโด": "https://commons.wikimedia.org/wiki/Special:FilePath/SapporoCity_Skylines2020.jpg?width=640",
  "เกียวโต": "https://commons.wikimedia.org/wiki/Special:FilePath/Kiyomizu.jpg?width=640",
  "ชิราคาวาโก": "https://commons.wikimedia.org/wiki/Special:FilePath/Ogi_Shirakawa-g%C5%8D%2C_Gifu%2C_Japan.jpg?width=640",
  "ทาคายาม่า": "https://commons.wikimedia.org/wiki/Special:FilePath/Takayama%27s_Early_Winter_Welcome_%28NE%29.jpg?width=640",
  "โอกินาว่า": "https://commons.wikimedia.org/wiki/Special:FilePath/Naha_Okinawa_Japan_Shuri-Castle-01.jpg?width=640",
  "คามาคุระ": "https://commons.wikimedia.org/wiki/Special:FilePath/230128_Kamakura_Daibutsu_Japan04s3.jpg?width=640",
  "ไทจง": "https://commons.wikimedia.org/wiki/Special:FilePath/Kaohsiung_Skyline_2020_%28cropped%29.jpg?width=640",
  "เกาสง": "https://commons.wikimedia.org/wiki/Special:FilePath/Kaohsiung_Skyline_2020_%28cropped%29.jpg?width=640",
  "ฮัวเหลียน": "https://commons.wikimedia.org/wiki/Special:FilePath/Jiuqudong_2003-01.jpg?width=640",
  "ฟูก๊วก": "https://commons.wikimedia.org/wiki/Special:FilePath/Bai-sao-phu-quoc-tuonglamphotos.jpg?width=640",
  "ดาลัด": "https://commons.wikimedia.org/wiki/Special:FilePath/Xuan_Huong_Lake_11.jpg?width=640",
  "ฮาลอง": "https://commons.wikimedia.org/wiki/Special:FilePath/Ha_Long_Bay_in_2019.jpg?width=640",
  "โซล": "https://commons.wikimedia.org/wiki/Special:FilePath/%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg?width=640",
  "เชจู": "https://commons.wikimedia.org/wiki/Special:FilePath/Jeju_Island.jpg?width=640"
};

module.exports = { COUNTRY_IMG, CITY_IMG };

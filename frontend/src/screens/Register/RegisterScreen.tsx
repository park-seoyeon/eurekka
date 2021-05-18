import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Image,
  StyleSheet,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { images } from '../../common/images';
import { theme } from '../../common/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { List } from 'react-native-paper';
import { RegisterContext } from '../../contexts';
import axios from 'axios';
import { DateModal, CustomButton } from '../../components';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 식품 등록 화면
const RegisterScreen = ({ navigation }) => {
  const styles = StyleSheet.create({
    flatlist: {
      backgroundColor: theme.background,
    },
    container: {
      backgroundColor: theme.background,
      height: '100%',
      marginTop: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 20,
      color: '#E8EEF7',
    },
    header: {
      width: 370,
      height: 50,
      backgroundColor: '#606DCA',
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    body: {
      marginLeft: 5,
    },
    img: {
      alignSelf: 'center',
      width: 150,
      height: 150,
    },
    row: {
      flexDirection: 'row',
    },
    text: {
      fontSize: 20,
      color: '#4d4d4d',
      alignSelf: 'center',
      width: 80,
    },
    scroll: {
      maxHeight: 120,
    },
    listText: {
      marginLeft: -15,
      marginTop: -10,
      marginBottom: -10,
      fontSize: 20,
      color: '#4d4d4d',
    },
    input: {
      borderBottomColor: '#000000',
      borderBottomWidth: 1,
      color: '#000000',
      width: 200,
      marginHorizontal: 10,
    },
    dateInput: {
      borderBottomColor: '#000000',
      borderBottomWidth: 1,
      color: '#000000',
      width: 160,
      marginHorizontal: 10,
    },
    touch: {
      marginTop: 22,
      marginLeft: 10,
    },
    button: {
      marginTop: 20,
      alignSelf: 'flex-end',
    },
    date: {
      marginTop: 50,
    },
  });

  // 등록 화면에서 공통으로 사용할 바코드, 유통기한 변수, 메소드
  const { barcode, expirationDate, updateCode, updateDate } =
    useContext(RegisterContext);

  const setTime = () => {
    const cur = new Date();
    const utc = cur.getTime() + cur.getTimezoneOffset() * 60 * 1000;

    const KR_TIME_DIFF = 9 * 60 * 60 * 1000;
    const kr_time = new Date(utc + KR_TIME_DIFF);

    return kr_time.toISOString().split('T')[0];
  };

  // 순서대로 사진, 식품명, 재료명, 품목, 유통기한
  const [img, setImg] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [ingredient, setIngredient] = useState<string>('');
  const [category, setCategory] = useState<string>('품목');
  const [categoryId, setCategoryId] = useState<number>(0);
  const [date, setDate] = useState<string>(setTime());

  // 품목 Accordian 확장하는 변수, 메소드
  const [expanded, setExpanded] = useState<boolean>(false);
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // 품목 이름 설정하는 메소드
  const getCategory = (item) => {
    setCategory(item.title);
    setCategoryId(item.id);
    setExpanded(false);
  };

  // 품목명 리스트
  const list = [
    {
      id: 0,
      title: '면류',
    },
    {
      id: 1,
      title: '제과제빵류',
    },
    {
      id: 2,
      title: '음료',
    },
    {
      id: 3,
      title: '절임류',
    },
    {
      id: 4,
      title: '유제품',
    },
    {
      id: 5,
      title: '건강식품',
    },
    {
      id: 6,
      title: '분말류',
    },
    {
      id: 7,
      title: '육류',
    },
    {
      id: 8,
      title: '양념류',
    },
    {
      id: 9,
      title: '수산물',
    },
    {
      id: 10,
      title: '과채류',
    },
    {
      id: 11,
      title: '주류',
    },
    {
      id: 12,
      title: '냉동식품',
    },
    {
      id: 13,
      title: '빙과류',
    },
    {
      id: 14,
      title: '기타',
    },
  ];

  // 리스트에 담긴 항목 Accordian안에 담아 보여줌
  const listItem = ({ item }) => (
    <List.Item title={item.title} onPress={() => getCategory(item)} />
  );

  // 입력값 초기화
  const resetTextInput = () => {
    setName('');
    setIngredient('');
    setCategory('품목');
    setCategoryId(0);
    setDate(setTime());
    setImg('');
  };

  // 읽어온 바코드 값이 있을 때
  useEffect(() => {
    if (barcode.length > 0) {
      findDataByBarcode();
    } else {
      resetTextInput();
    }
  }, [barcode]);

  // 읽어온 유통기한 값이 있을 때
  useEffect(() => {
    if (expirationDate.length > 0) {
      setDate(expirationDate);
    } else {
      setDate(setTime());
    }
  }, [expirationDate]);

  // 바코드 데이터 조회
  const findDataByBarcode = () => {
    axios
      .get(`http://eurekka.kr:5000/barcode`, {
        params: {
          code: barcode,
        },
      })
      .then((res) => {
        setCategory(res.data.category);
        setImg(res.data.imgUrl);
        setName(res.data.name);
      })
      .catch((err) => {
        console.log(err.response);
        alert('스캔하신 바코드의 정보가 없습니다.');
        resetTextInput();
      });
  };

  // 날짜 선택 모달 control 하는 변수, 메소드
  const [isModal, setModal] = useState<boolean>(false);
  const closeModal = () => {
    setModal(false);
  };

  //상품 등록을 위한 냉장고 ID 가져옴
  const [refrigerId, setRefId] = useState<String>('');
  AsyncStorage.getItem('userInfo', (err, res) => {
    const user = JSON.parse(res);
    setRefId(user.refrigeratorId);
  });

  //상품 등록하는 메소드
  const registerProduct = () => {
    if (name.length == 0) {
      alert('상품명을 입력해주세요');
      return;
    } else if (ingredient.length == 0) {
      alert('재료명을 입력해주세요.');
      return;
    } else if (category == '품목') {
      alert('품목을 선택해주세요.');
      return;
    } else if (date.length == 0) {
      alert('유통기한을 입력해주세요.');
      return;
    }

    axios
      .post(`http://eurekka.kr:5000/refrigerator/${refrigerId}`, {
        name: name,
        expirationDate: date,
        ingredient: ingredient,
        category: categoryId,
      })
      .then((res) => {
        alert('등록이 완료되었습니다.');
        updateCode('');
        updateDate('');
      })
      .catch((err) => {
        console.log(err);
        alert('등록에 실패했습니다.');
      });
  };

  let flatListRef = useRef(null);
  const toTop = () => {
    if (flatListRef.current == null) return;
    flatListRef.current.scrollTo({ animated: true, y: 0 });
  };
  useEffect(() => {
    const reload = navigation.addListener('focus', () => {
      toTop();
    });
    return reload;
  }, [navigation]);

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>상품 등록</Text>
        </View>
        {img.length > 0 ? (
          <Image source={{ uri: img }} style={styles.img} />
        ) : (
          <Image source={images.noImg} style={styles.img} />
        )}
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.text}>상품명</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            ></TextInput>
            <TouchableOpacity
              style={styles.touch}
              onPress={() => {
                navigation.navigate('Barcode');
              }}
            >
              <MaterialCommunityIcons
                name="barcode-scan"
                size={32}
                color="#000000"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.text}>재료명</Text>
            <TextInput
              style={styles.input}
              value={ingredient}
              onChangeText={setIngredient}
            ></TextInput>
          </View>
          <View style={styles.scroll}>
            <List.Accordion
              title={category}
              titleStyle={[styles.listText]}
              expanded={expanded}
              onPress={() => toggleExpanded()}
            >
              <FlatList
                data={list}
                renderItem={listItem}
                keyExtractor={(item, index) => index.toString()}
              />
            </List.Accordion>
          </View>
          <View style={expanded ? styles.date : null}>
            <View style={styles.row}>
              <Text style={styles.text}>유통기한</Text>
              <TextInput
                style={styles.dateInput}
                value={date}
                editable={false}
              ></TextInput>
              <TouchableOpacity
                style={styles.touch}
                onPress={() => {
                  setModal(true);
                }}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={32}
                  color="#000000"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.touch}
                onPress={() => {
                  navigation.navigate('OCR');
                }}
              >
                <MaterialCommunityIcons
                  name="camera"
                  size={32}
                  color="#000000"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.button}>
              <CustomButton
                title="등록하기"
                onPress={() => {
                  registerProduct();
                }}
              />
            </View>
          </View>
        </View>
      </View>
      <DateModal isModal={isModal} close={closeModal} />
    </SafeAreaView>
  );
};

export default RegisterScreen;

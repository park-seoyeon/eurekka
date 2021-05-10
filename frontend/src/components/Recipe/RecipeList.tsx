import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Image,
} from 'react-native';
import { List, ProgressBar, Colors } from 'react-native-paper';
import { images } from '../../common/images';
import { theme } from '../../common/theme';

export const Separator = () => <View style={styles.separator} />;

const RecipeList = ({ seq, title, percentage, img }) => {
  const per = (percentage * 100).toFixed(2);
  return (
    <View style={styles.container}>
      <List.Item
        title={title}
        left={(props) => (
          <Image source={{ uri: img }} style={styles.recipeImg} />
        )}
        right={(props) => (
          <View style={styles.rightSection}>
            <Text style={{ fontSize: 13 }}>냉장고 속 재료 일치도</Text>
            <Text style={styles.percent}>{per}%</Text>
            <View style={styles.progressSection}>
              <ProgressBar progress={percentage} color={'#4A63FF'} />
            </View>
          </View>
        )}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#e4e4e4',
    marginLeft: 10,
  },
  recipeImg: {
    width: 50,
    height: 50,
    borderRadius: 50,
    borderColor: '#BACDE6',
    borderWidth: 2.5,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  percent: {
    fontSize: 12,
    paddingTop: 5,
    paddingBottom: 3,
  },
  progressSection: {
    width: 100,
  },
});
export default RecipeList;

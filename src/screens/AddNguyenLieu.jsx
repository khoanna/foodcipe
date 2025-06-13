import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput, Alert, Modal } from 'react-native'
import { useState } from 'react'
import { getToken } from '../helpers/common';
import React from 'react'
import { useFocusEffect } from '@react-navigation/native';
import { Loading, ScreenWrapper } from '../components';
import Icon from '../assets/icons'
import { theme } from '../constants/theme';
import { Input } from '../components';
import API from '../API';

export default function AddNguyenLieu({ navigation }) {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [tenNL, setTenNL] = useState('');
  const [calories, setCalories] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editIngredient, setEditIngredient] = useState(null);

  const openEditModal = (ingredient) => {
      setEditIngredient(ingredient);
      setEditModalVisible(true);
  };
  const load = async () => {
    setLoading(true);
    const token = await getToken();
    const response = await fetch(`${API}/api/NguyenLieu/getallnguyenlieu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token)
    });
    const data = await response.json();
    setIngredients((prev) => data);
    setLoading(false);
  }

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        await load();
      })();
      return () => { };
    }, [navigation])
  );

  const filteredIngredients = ingredients.filter(item =>
    item.tenNL.toLowerCase().includes(searchText.toLowerCase())
  );


  const handleDelete = async (maNL) => {
    const token = await getToken();
    const respone = await fetch(`${API}/api/NguyenLieu/deleteNguyenLieuForAdmin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token, maNL: Number(maNL) })
    })
    if (respone.ok) {
      await load();
    }
    else
    {
      Alert.alert("Xoá nguyên liệu", "Nguyên liệu đang được sử dụng, không thể xóa!");
    }
  }

  const handleAdd = async () => {
    if (!tenNL || !calories) {
      Alert.alert("Thêm nguyên liệu", "Vui lòng nhập thông tin nguyên liệu!")
    }
    if (!/^\d+$/.test(calories)) {
      Alert.alert("Thêm nguyên liệu", 'Calories chỉ được chứa số!');
      return;
    }
    if (Number(calories) <= 0) {
      Alert.alert("Thêm nguyên liệu", 'Calories không được bé hơn bằng 0!');
      return;
    }
    setLoading(true);
    const token = await getToken();
    const respone = await fetch(`${API}/api/NguyenLieu/addnguyenlieu`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token, tenNL, calories: Number(calories), anhNL: "string" })
    })
    if (respone.ok) {
      setTenNL('');
      setCalories('');
      await load();
    }
    setLoading(false);
  }

  const handleEditSave = async () => {
  setLoading(true);
  const token = await getToken();
  const respone = await fetch(`${API}/api/NguyenLieu/updateNguyenLieu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      maNL: editIngredient.maNL,
      tenNL: editIngredient.tenNL,
      calories: Number(editIngredient.calories),
      anhNL: "string"
    })
  });
  if (respone.ok) {
    setEditModalVisible(false);
    await load();
    setLoading(false);
    Alert.alert("Cập nhật nguyên liệu", "Cập nhật nguyên liệu thành công!");
  }
  else 
  {
    setEditModalVisible(false);
    await load();
    setLoading(false);
    Alert.alert("Cập nhật nguyên liệu", "Cập nhật nguyên liệu thất bại!");
  }
};
  return (
    <ScreenWrapper>
      {loading ? <Loading /> : (
        <View style={styles.container}>
          <Text style={styles.title}>Quản Lý Nguyên Liệu</Text>
          <TextInput
            style={styles.input}
            placeholder="Tên nguyên liệu"
            value={tenNL}
            onChangeText={setTenNL}
          />
          <TextInput
            style={styles.input}
            placeholder="Calories"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.button} onPress={() => handleAdd()}>
            <Text style={styles.buttonText}>Thêm</Text>
          </TouchableOpacity>
          <View style={{ marginVertical: 12 }}>
            <Input
              value={searchText}
              placeholder='Tìm kiếm nguyên liệu'
              onChangeText={value => setSearchText(value)}
            />
          </View>
          <FlatList
            data={filteredIngredients}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View >
                  <Text style={styles.name}>{item?.tenNL}</Text>
                  <Text style={styles.calories}>{item?.calories} kcal</Text>
                </View>
                <View style={styles.iconRow}>
                  <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Icon name='edit' size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item?.maNL)}>
                    <Icon name='delete' size={20} color={theme.colors.rose} />
                  </TouchableOpacity>
                </View>
                
              </View >
            )}
          />
        </View>
      )}
      {editModalVisible && (
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000088' }}>
          <View style={{ backgroundColor: '#fff', padding: 20, borderRadius: 12, width: '80%' }}>
            <TextInput
              style={styles.input}
              value={editIngredient?.tenNL}
              onChangeText={text => setEditIngredient({ ...editIngredient, tenNL: text })}
              editable={false}
              placeholder="Tên nguyên liệu"
            />
            <TextInput
              style={styles.input}
              value={String(editIngredient?.calories)}
              onChangeText={text => setEditIngredient({ ...editIngredient, calories: text })}
              placeholder="Calories"
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={handleEditSave}>
              <Text style={styles.buttonText}>Lưu</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#ccc' }]} onPress={() => setEditModalVisible(false)}>
              <Text style={styles.buttonText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )}
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  iconRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8, // or use marginRight on the first icon if gap is not supported
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  calories: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  calories: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'EditarCategoria'>;

interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

const EditarCategoriaScreen = ({ route, navigation }: Props) => {
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.categories);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    setSaving(true);
    try {
      await api.put(`/categories/${category.id}`, category);
      Alert.alert('Sucesso', 'Categoria atualizada com sucesso');
      await loadCategories();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta categoria?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/categories/${categoryId}`);
              Alert.alert('Sucesso', 'Categoria excluída com sucesso');
              await loadCategories();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a categoria');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {categories.map((category) => (
        <View
          key={category.id}
          style={[styles.categoryCard, { backgroundColor: colors.card }]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.categoryName, { color: colors.textPrimary }]}>
              {category.name}
            </Text>
            <Switch
              value={category.active}
              onValueChange={(value) =>
                handleUpdateCategory({ ...category, active: value })
              }
              disabled={saving}
            />
          </View>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.textPrimary,
              },
            ]}
            value={category.description}
            onChangeText={(text) =>
              handleUpdateCategory({ ...category, description: text })
            }
            placeholder="Descrição da categoria"
            placeholderTextColor={colors.placeholder}
            multiline
            editable={!saving}
          />

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.error }]}
              onPress={() => handleDeleteCategory(category.id)}
              disabled={saving}
            >
              <Text style={[styles.buttonText, { color: colors.buttonText }]}>
                Excluir
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  categoryCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EditarCategoriaScreen;
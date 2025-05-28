import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: string;
  table: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED';
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

const OrdersScreen = () => {
  const { colors } = useTheme();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os pedidos');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return colors.warning;
      case 'PREPARING':
        return colors.info;
      case 'READY':
        return colors.success;
      case 'DELIVERED':
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'PENDING':
        return 'Pendente';
      case 'PREPARING':
        return 'Preparando';
      case 'READY':
        return 'Pronto';
      case 'DELIVERED':
        return 'Entregue';
      default:
        return status;
    }
  };

  const renderOrderCard = ({ item: order }: { item: Order }) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.tableText, { color: colors.textPrimary }]}>
          {order.table}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View style={styles.itemsList}>
        {order.items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={[styles.itemQuantity, { color: colors.textPrimary }]}>
              {item.quantity}x
            </Text>
            <View style={styles.itemDetails}>
              <Text style={[styles.itemText, { color: colors.textPrimary }]}>
                Item #{item.id}
              </Text>
              {item.notes && (
                <Text style={[styles.itemNotes, { color: colors.textSecondary }]}>
                  {item.notes}
                </Text>
              )}
            </View>
            <Text style={[styles.itemPrice, { color: colors.textPrimary }]}>
              R$ {item.price.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.totalText, { color: colors.textPrimary }]}>
          Total: R$ {order.total.toFixed(2)}
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => {/* Implementar ação */}}
        >
          <Icon name="arrow-right" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={orders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  card: {
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
  tableText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  itemsList: {
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
  },
  itemNotes: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrdersScreen;
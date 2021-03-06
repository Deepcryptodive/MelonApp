import React, { Component } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, TextInput, Modal, ActivityIndicator, Alert } from 'react-native';
import Title from '../components/title'
import { goBack } from '../navigation/navigator';
import { getOrders, takeOrder, makeOrder, cancelOrder } from '../wrapper/melon';
import assets from '../assets'
import isTradeableNumber from '../helpers/isTradeableNumber';
import CMCButton from '../components/cmc';

export default class Asset extends Component {

  state = { orders: { add: [], remove: [] }, isLoading: true, isOrdering: false, value: '', valueInWeth: '' }

  async componentDidMount() {
    var { symbol } = this.props.navigation.state.params;
    if (symbol === 'WETH') return;
    var addOrders = await getOrders('WETH', symbol, 'add')
    var removeOrders = await getOrders(symbol, 'WETH', 'remove')
    this.setState((prevState, props) => Object.assign({}, prevState, { orders: { add: addOrders, remove: removeOrders }, isLoading: false }))
  }

  render() {
    var { symbol, name, balance } = this.props.navigation.state.params;
    return <ScrollView>
      <Modal
        animationType="slide"
        transparent={false}
        visible={this.state.isOrdering}
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator />
          <Text style={{ fontWeight: 'bold', marginTop: 16 }}>Attempting Order...</Text>
        </View>
      </Modal>
      <Text
        onPress={() => goBack()}
        style={{ position: 'absolute', right: 0, fontSize: 12, fontWeight: '100', color: 'grey', zIndex: 1, padding: 16, top: -16 }}>
        BACK
      </Text>
      <Title text={symbol} />
      <View style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
        <Image source={assets.tokens.black.ant} style={{ height: 80, width: 80, marginRight: 8 }} />
        <View>
          <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>{name}</Text>
          <Text style={{ fontSize: 16, fontWeight: '100', color: 'black' }}>{balance}</Text>
        </View>
      </View>
      <CMCButton symbol={symbol} />
      <TextInput
        underlineColorAndroid='transparent'
        placeholder={symbol}
        style={{ paddingLeft: 16, fontSize: 32, fontWeight: '200' }}
        keyboardType={'numeric'}
        onChangeText={value => this.setState((prevState, props) => Object.assign({}, prevState, { value }))}
        value={this.state.value}
      />
      <View style={{ backgroundColor: 'rgb(230,230,230)', width: '100%', height: 1, marginBottom: 12 }} />
      <TextInput
        underlineColorAndroid='transparent'
        placeholder={'WETH'}
        style={{ paddingLeft: 16, fontSize: 32, fontWeight: '200' }}
        keyboardType={'numeric'}
        onChangeText={value => this.setState((prevState, props) => Object.assign({}, prevState, { valueInWeth: value }))}
        value={this.state.valueInWeth}
      />
      <View style={{ backgroundColor: 'rgb(230,230,230)', width: '100%', height: 1 }} />
      {/* TODO only take numbers input */}
      <View style={{ margin: 16, flexDirection: 'row' }}>
        {this.renderButton('SELL')}
        {this.renderButton('BUY')}
      </View>
      <Text style={{ fontSize: 16, fontWeight: 'bold', margin: 16 }}>Orderbook</Text>
      {this.state.isLoading ? <Text style={{ margin: 16 }}>Loading...</Text> : null}
      {this.state.orders.add.map(order => this.renderOrders('add', order))}
      {this.state.orders.remove.map(order => this.renderOrders('remove', order))}
      <View style={{ marginBottom: 40 }} />
    </ScrollView>
  }

  renderButton(text) {
    return <TouchableOpacity
      onPress={() => this.handleMakeOrder(text)}
      style={{ height: 40, width: '50%', backgroundColor: text == 'SELL' ? 'black' : 'white', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', borderColor: 'black', borderWidth: 1 }}>
      <Text style={{ fontWeight: 'bold', color: text == 'SELL' ? 'white' : 'black', fontSize: 20 }}>{text}</Text>
    </TouchableOpacity>
  }
  renderOrders(action, order) {
    return <TouchableOpacity onPress={() => this.handleTakeOrder(order)} key={order.id} style={{ height: 30, flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
      <View style={{ height: 30, width: 30, borderRadius: 15, backgroundColor: (action == 'add') ? 'lightgreen' : '#ff2b2b', marginHorizontal: 16 }}>
        <Image source={assets.images.white[action == 'add' ? 'plus' : 'minus']} style={{ height: 16, width: 16, marginLeft: 7, marginTop: 7 }} />
      </View>
      {(action == 'add') ? <Text>{(order.trade.quote.quantity / Math.pow(10, order.trade.quote.token.decimals)).toFixed(2) + ' ' + order.trade.quote.token.symbol} for {(order.trade.base.quantity / Math.pow(10, 18)).toFixed(2)} Ξ total</Text> : <Text>{(order.trade.base.quantity / Math.pow(10, order.trade.base.token.decimals)).toFixed(2) + ' ' + order.trade.base.token.symbol} for {(order.trade.quote.quantity / Math.pow(10, order.trade.quote.token.decimals)).toFixed(2)} Ξ total</Text>}
      {order.isMine ? <TouchableOpacity onPress={() => this.handleCancelOrder(order)} style={{ height: 30, width: 30, borderRadius: 15, backgroundColor: 'lightgrey', marginHorizontal: 16 }}>
        <Text style={{ fontSize: 24, textAlign: 'center', fontWeight: '700', bottom: 2, left: 1, color: 'white' }}>x</Text>
      </TouchableOpacity> : null}
    </TouchableOpacity>
  }

  async handleTakeOrder(order) {
    this.setState((prevState, props) => Object.assign({}, prevState, { isOrdering: true }))
    try {
      await takeOrder(order.original.id);
      Alert.alert("Success", "Successfully proccessed order " + order.original.id, [
        { text: 'OK', onPress: () => goBack() },
      ]);
    }
    catch (e) {
      Alert.alert("Error", e.message, [
        { text: 'OK', onPress: () => this.setState((prevState, props) => Object.assign({}, prevState, { isOrdering: false })) },
      ]);
    }
  }
  async handleCancelOrder(order){
    this.setState((prevState, props) => Object.assign({}, prevState, { isOrdering: true }))
    try {
      await cancelOrder(order.original.id);
      Alert.alert("Success", "Successfully cancelled order " + order.original.id, [
        { text: 'OK', onPress: () => goBack() },
      ]);
    }
    catch (e) {
      Alert.alert("Error", e.message, [
        { text: 'OK', onPress: () => this.setState((prevState, props) => Object.assign({}, prevState, { isOrdering: false })) },
      ]);
    }
  }

  async handleMakeOrder(action) {
    var value = this.state.value;
    var valueInWeth = this.state.valueInWeth;
    if (!isTradeableNumber(value) || !isTradeableNumber(valueInWeth)) alert('Invalid input')
    this.setState((prevState, props) => Object.assign({}, prevState, { isOrdering: true }))
    try {
      await makeOrder(this.props.navigation.state.params.symbol, valueInWeth, value, action)
      Alert.alert("Success", "Successfully proccessed order", [
        { text: 'OK', onPress: () => goBack() },
      ]);
    }
    catch (e) {
      Alert.alert("Error", e.message, [
        { text: 'OK', onPress: () => this.setState((prevState, props) => Object.assign({}, prevState, { isOrdering: false })) },
      ]);
    }
  }
}
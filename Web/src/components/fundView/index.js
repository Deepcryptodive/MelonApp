import React from 'react';
import { getHoldings, getAllAssets, calculateAUM } from '../../wrapper/melon'
import getImageUrl from '../../helpers/getImageUrl';

class Fund extends React.Component {
  state = { assets: [], selectedIndex: 0 }

  async componentDidMount() {
    try {
      var holdings = await getHoldings();
      holdings = holdings.reduce((assets, asset) => {
        asset.quantity = (asset.quantity / Math.pow(10, asset.token.decimals))
        assets[asset.token.symbol] = asset;
        return assets;
      }, {})

      var assets = await getAllAssets();
      assets = assets.map(asset => {
        if (holdings[asset.token.symbol]) return Object.assign({}, holdings[asset.token.symbol], asset);
        else return Object.assign({}, asset, { quantity: 0 });
      })
      assets = assets.sort((a, b) => b.quantity - a.quantity)
      this.props.setAum(await calculateAUM(holdings))
      this.selectAsset(assets[0], 0)
      this.setState((prevState, props) => Object.assign({}, prevState, { assets, selectedIndex: 0 }))
    }
    catch (e) {
      console.error(e.message)
    }
  }

  render() {
    return (
      <div className="fund-view">
        {this.state.assets.map(this.renderAsset.bind(this))}
      </div>
    );
  }

  renderAsset(asset, i) {
    return (<div key={asset.token.symbol} className={i == this.state.selectedIndex ? "asset selected" : "asset"} onClick={_ => this.selectAsset(asset, i)}>
      <img src={getImageUrl(asset.token.symbol)} height="40" width="40" />
      <span className="title">{asset.token.symbol}</span>
      <br />
      <div className="subtitle">{asset.token.name}</div>
      <div className="balance">{asset.quantity.toFixed(2) || 0}</div>
    </div>
    );
  }

  selectAsset(asset, index) {
    this.setState((prevState, props) => Object.assign({}, prevState, { selectedIndex: index }))
    this.props.selectAsset(asset)
  }
}
export default Fund;
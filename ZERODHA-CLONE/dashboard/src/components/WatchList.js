import React, { useState } from "react";
import { Tooltip, Grow } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { watchlist } from '../data/data';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const WatchList = () => {
  return (
    <div className="watchlist-container">
      <div className="search-container">
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg:infy, bse, nifty fut weekly, gold mcx"
          className="search"
        />
        <span className="counts"> {watchlist.length} / 50</span>
      </div>

      <ul className="list">
        {watchlist.map((stock, index) => {
          return (
            <WatchListItem key={index} stock={stock} />
          );
        })}
      </ul>
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  }

  const handleMouseLeave = () => {
    setIsHovered(false);
  }

  return (
    <li
      className="list-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>{stock.name}</p>

        <div className="itemInfo">
          <span className="percent">{stock.percent}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}  
          <span className="price">{stock.price}</span>
        </div>
      </div>

      {isHovered && <WatchListAction uid={stock.name} />}
    </li>
  );
};


const WatchListAction = ({uid}) => {
  return (
    <span className="actions">
      <span>
        <Tooltip title="Buy (B)" placement="top" arrowTransitionComponent={Grow}>
          <button className="buy">Buy</button>
        </Tooltip>
      </span>

      <span>
        <Tooltip title="Sell (S)" placement="top" arrowTransitionComponent={Grow}>
          <button className="sell">Sell</button>
        </Tooltip>
      </span>

      <span>
        <Tooltip title="Analyse (A)" placement="top" arrowTransitionComponent={Grow}>
          <button className="action">
          <BarChartOutlinedIcon className="icon" />
          </button>
        </Tooltip>
      </span>

      <span>
        <Tooltip title="More" placement="top" arrowTransitionComponent={Grow}>
          <button className="action">
            <MoreHorizIcon className="icon" />
            </button>
        </Tooltip>
      </span>
    </span>
  );
}


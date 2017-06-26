var hotController = require('../renderer/hot.js');

const {remote} = require('electron');
const {Menu, MenuItem} = remote;

var menu = new Menu();

var rowAbove = new MenuItem({
  label: 'Insert row above',
  click: function() {
    hotController.insertRowAbove(true);
  }
});

var rowBelow = new MenuItem({
  label: 'Insert row below',
  click: function() {
    hotController.insertRowBelow(true);
  }
});

var columnLeft = new MenuItem({
  label: 'Insert column left',
  click: function() {
    hotController.insertColumnLeft(true);
  }
});

var columnRight = new MenuItem({
  label: 'Insert column right',
  click: function() {
    hotController.insertColumnRight(true);
  }
});

var removeRow = new MenuItem({
  label: 'Remove row(s)',
  click: function() {
    hotController.removeRows();
  }
});

var removeCol = new MenuItem({
  label: 'Remove column(s)',
  click: function() {
    hotController.removeColumns();
  }
});

var freezeRow = new MenuItem({
    label: 'Freeze row(s) above',
    click: function(){
      hotController.freezeRows();
    }
});

var unfreezeRow = new MenuItem({
    label: 'unfreeze row(s)',
    click: function(){
        hotController.unfreeze();
    }
});

menu.append(freezeRow);
menu.append(unfreezeRow);
menu.append(new MenuItem({ type: 'separator' }));
menu.append(rowAbove);
menu.append(rowBelow);
menu.append(new MenuItem({ type: 'separator' }));
menu.append(columnLeft);
menu.append(columnRight);
menu.append(new MenuItem({ type: 'separator' }));
menu.append(removeRow);
menu.append(removeCol);

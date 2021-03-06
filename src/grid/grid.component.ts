import { GridColumn } from './../../dist/grid/grid.model.d';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { GridColumn, GridOption, GridEvent, NgSimpleGrid } from './grid.model';

@Component({
  selector: 'ng-simple-grid',
  styleUrls: [`./grid.component.scss`],
  templateUrl: './grid.component.html'
})

export class GridComponent implements OnInit {
  @Input()
  config: NgSimpleGrid = {
    columns: [
      { type: 'text', key: 'grid', name: 'Grid', width: '100%'}
    ],
    option: {
      rowsPerPage: 10,
      emptyMessage: '',
      emptySubMessage: '',
      rowHeight: 40
    },
    event: {
      onClickRow: (datarow: any, index: number) => {
      },
      onDbClickRow: (datarow: any, index: number) => {
      }
    }
  };

  @Input()
  dataList: any[] = [];

  default: any = {
    option: {
      emptyMessage: 'No results',
      rowHeight:    40
    }
  }

  dataListToShow: any[]     = [];

  dataListPerPage: any[];

  totalPageCount: number    = 1;

  currentPageIndex: number  = 0;

  emptyRows: any[]          = [];

  constructor() { 
  }

  ngOnInit(): void {
    if(this.dataList && this.dataList.length > 0) {
      this._initializeData(this.dataList, this.config.option.rowsPerPage);
    }
  }
  
  setDataList(dataList: any[]): void {
    this.dataList = dataList;
    
    this._initializeData(dataList, this.config.option.rowsPerPage);
  }

  private _initializeData(dataList: any[], rowsPerPage: number): void {

    this.totalPageCount   = this._getTotalPageCount(dataList, rowsPerPage);
    this.dataListPerPage  = this._getDataListPerPage(dataList, rowsPerPage, this.totalPageCount);
    this.dataListToShow   = this.dataListPerPage[0] || [];
    this.emptyRows        = this._getEmptyRowsToBeFilled(this.dataListToShow, rowsPerPage);
  }

  search(key: string, value: string): void {
    if(!this.dataList) 
      return ;

    if(value === '') {
      this._initializeData(this.dataList, this.config.option.rowsPerPage);
      return ;
    }

    let filteredList = this.dataList.filter(data => data[key].includes(value));

    this._initializeData(filteredList, this.config.option.rowsPerPage);
  }

  onClickDataItem(e: any,  value: any, datarow: any, key: string, index: number): void {
    e.stopPropagation();

    let column: GridColumn = this._getColumnByProperty(this.config.columns, key, 'onClick');

    if(column == null)
      return ;

    column.onClick(e, value, index, datarow);
  }

  createRange(number: number) {
    let numberList: number[] = [];

    for(let i = 1; i <= number; i++) {
      numberList.push(i);
    }

    return numberList;
  }

  deriveValue(column: GridColumn, datarow: any, rowIndex: number, colIndex: number) {
    if(column.value)          return column.value;
    if(column.onCustomValue)  return column.onCustomValue(datarow, rowIndex, colIndex);

    return (column.nullValue && !datarow[column.key]) ? column.nullValue : datarow[column.key];
  }

  onMovePage(pageIndex: number): void {
    if(!this.dataListPerPage) 
      return ;

    this.dataListToShow   = this.dataListPerPage[pageIndex];
    this.emptyRows        = this._getEmptyRowsToBeFilled(this.dataListToShow, this.config.option.rowsPerPage);
    this.currentPageIndex = pageIndex;
  }

  onClickDataRow(e: any, row: any, index: number) {
    if(this.config.event && this.config.event.onClickRow) {
      this.config.event.onClickRow(row, index);
    }
  }

  onDbClickDataRow(e: any, row: any, index: number) {
    if(this.config.event && this.config.event.onDbClickRow) {
      this.config.event.onDbClickRow(row, index);
    }
  }

  isEmptyDataList() {
    return this.dataListToShow.length === 0
  }

  isTextType(column: GridColumn) {
    return column.type === 'text';
  }

  isButtonType(column: GridColumn) {
    return column.type === 'button';
  }

  private _getColumnByProperty(columns: GridColumn[], key: string, property: string): GridColumn {
    let selectedColumn: GridColumn = null;

    for(let column of columns) {
      if(column.key == key) {
        if(column.hasOwnProperty(property)) {
          selectedColumn = column;
          break;
        }
      }
    }

    return selectedColumn;
  }

  private _getTotalPageCount(dataList: any[], rowsPerPage: number): any {
    let dataListSize  = dataList.length;
    
    return Math.ceil(dataListSize / rowsPerPage);
  }

  private _getDataListPerPage(dataList: any[], rowsPerPage: number, totalPageCount: number): any {
    let dataListPerPage = [];

    for(let i = 0; i <= totalPageCount; i++) {
      dataListPerPage.push(this.dataList.splice(0, rowsPerPage));
    }

    return dataListPerPage;
  }

  private _getEmptyRowsToBeFilled(lastDataList: any[], rowsPerPage: number) {
    if(lastDataList && lastDataList.length === 0)
      return [];

    let emptyRowsCount = rowsPerPage - lastDataList.length;

    return new Array(emptyRowsCount);
  }
}
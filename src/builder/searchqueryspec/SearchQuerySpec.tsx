import React, { PureComponent } from 'react';
import { css } from 'emotion';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';
import { All, Contains, Fragment, InsensitiveContains, Regex } from './';
import { QueryBuilderProps, QueryBuilderOptions } from '../types';

interface State {
  selectedOption: SelectableValue<string>;
}

export class SearchQuerySpec extends PureComponent<QueryBuilderProps, State> {
  state: State = {
    selectedOption: {},
  };

  constructor(props: QueryBuilderProps) {
    super(props);

    this.selectOptions = this.buildSelectOptions(['All', 'Contains', 'Fragment', 'InsensitiveContains', 'Regex']);

    const { builder } = props.options;

    if (undefined !== builder.type) {
      const selectedOption = this.selectOptionByValue(builder.type);
      if (null !== selectedOption) {
        this.state.selectedOption = selectedOption;
      }
    }
  }

  resetBuilder = () => {
    const { options, onOptionsChange } = this.props;
    options.builder = null;
    onOptionsChange(options);
  };

  onSelectionChange = (option: SelectableValue<string>) => {
    this.selectOption(option);
  };

  onCustomSelection = (selection: string) => {
    const option: SelectableValue<string> = { value: selection.toLowerCase(), label: selection };
    this.selectOptions.push(option);
    this.selectOption(option);
  };

  selectOption = (option: SelectableValue<string>) => {
    if (option === null) {
      option = {} as SelectableValue;
      this.resetBuilder();
    }
    this.setState({ selectedOption: option });
  };

  onOptionsChange = (options: QueryBuilderOptions) => {
    const { onOptionsChange } = this.props;
    onOptionsChange(options);
  };

  selectOptions: Array<SelectableValue<string>> = [];

  buildSelectOptions = (values: string[]): Array<SelectableValue<string>> => {
    return values.map((key, index) => {
      return { label: key, value: key.toLowerCase() };
    });
  };

  selectOptionByValue = (value: string): SelectableValue<string> | null => {
    const options = this.selectOptions.filter((option) => option.value === value.toLowerCase());
    if (options.length > 0) {
      return options[0];
    }
    return null;
  };

  builderOptions = (): QueryBuilderOptions => {
    const { builder, settings } = this.props.options;
    return { builder: builder || {}, settings: settings || {} };
  };

  render() {
    const { selectedOption } = this.state;
    const builderOptions = this.builderOptions();
    return (
      <>
        <div className="gf-form">
          <label className="gf-form-label">Search query spec</label>
          <div
            className={css`
              width: 300px;
            `}
          >
            <Select
              options={this.selectOptions}
              value={selectedOption}
              allowCustomValue
              onChange={this.onSelectionChange}
              onCreateOption={this.onCustomSelection}
              isClearable={true}
            />
          </div>
        </div>
        <div>
          {selectedOption.value === 'all' && <All options={builderOptions} onOptionsChange={this.onOptionsChange} />}
          {selectedOption.value === 'contains' && (
            <Contains options={builderOptions} onOptionsChange={this.onOptionsChange} />
          )}
          {selectedOption.value === 'fragment' && (
            <Fragment options={builderOptions} onOptionsChange={this.onOptionsChange} />
          )}
          {selectedOption.value === 'insensitivecontains' && (
            <InsensitiveContains options={builderOptions} onOptionsChange={this.onOptionsChange} />
          )}
          {selectedOption.value === 'regex' && (
            <Regex options={builderOptions} onOptionsChange={this.onOptionsChange} />
          )}
        </div>
      </>
    );
  }
}

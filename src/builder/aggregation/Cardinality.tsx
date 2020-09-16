import React, { FC, PureComponent, ChangeEvent } from 'react';
import { Button, Icon, LegacyForms, Checkbox, stylesFactory } from '@grafana/ui';
import { css } from 'emotion';
import uniqueId from 'lodash/uniqueId';
import { QueryBuilderProps, QueryBuilderOptions } from '../types';
import { Dimension } from '../dimension';

const { FormField } = LegacyForms;

interface State {
  components: string[];
}

interface ComponentRowProps {
  index: number;
  component: any;
  props: any;
  onRemove: (index: number) => void;
}

const getComponentRowStyles = stylesFactory(() => {
  return {
    layout: css`
      display: flex;
      margin-bottom: 4px;
      > * {
        margin-left: 4px;
        margin-bottom: 0;
        height: 100%;
        &:first-child,
        &:last-child {
          margin-left: 0;
        }
      }
    `,
  };
});

const ComponentRow: FC<ComponentRowProps> = ({ index, component, props, onRemove }) => {
  const styles = getComponentRowStyles();
  const Component = component;
  return (
    <div className={styles.layout}>
      <Component {...props} />
      <Button variant="secondary" size="xs" onClick={_e => onRemove(index)}>
        <Icon name="trash-alt" />
      </Button>
    </div>
  );
};

ComponentRow.displayName = 'ComponentRow';

export class Cardinality extends PureComponent<QueryBuilderProps, State> {
  state: State = {
    components: [],
  };

  constructor(props: QueryBuilderProps) {
    super(props);
    this.resetBuilder(['type', 'name', 'fields', 'byRow', 'round']);
    const { builder } = props.options;
    builder.type = 'cardinality';
    if (undefined === builder.fields) {
      builder.fields = [];
    }
    this.initializeState();
  }

  initializeState = () => {
    this.props.options.builder.fields.forEach(() => {
      this.state.components.push(uniqueId());
    });
  };

  resetBuilder = (properties: string[]) => {
    const { builder } = this.props.options;
    for (let key of Object.keys(builder)) {
      if (!properties.includes(key)) {
        delete builder[key];
      }
    }
  };

  onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { options, onOptionsChange } = this.props;
    const { builder } = options;
    let value: any = event.target.value;
    if ('number' === event.target.type) {
      value = Number(value);
    }
    builder[event.target.name] = value;
    onOptionsChange({ ...options, builder: builder });
  };

  onCheckboxChange = (component: string, event: ChangeEvent<HTMLInputElement>) => {
    const { options, onOptionsChange } = this.props;
    const { builder } = options;
    builder[component] = event.currentTarget.checked;
    onOptionsChange({ ...options, builder });
  };

  componentOptions = (index: number): QueryBuilderOptions => {
    const { builder, settings } = this.props.options;
    let componentBuilder = {};
    if (index <= builder.fields.length - 1) {
      componentBuilder = builder.fields[index];
    }
    return { builder: componentBuilder, settings: settings || {} };
  };

  onComponentOptionsChange = (index: number, componentOptions: QueryBuilderOptions) => {
    const { options, onOptionsChange } = this.props;
    const { builder, settings } = options;
    builder.fields[index] = componentOptions.builder;
    onOptionsChange({ ...options, builder, settings: { ...settings, ...componentOptions.settings } });
  };

  onComponentAdd = () => {
    const { options, onOptionsChange } = this.props;
    const { builder } = options;
    builder.fields.push({});
    onOptionsChange({ ...options, builder });
    this.setState(({ components }) => {
      return { components: [...components, uniqueId()] };
    });
  };

  onComponentRemove = (index: number) => {
    const { options, onOptionsChange } = this.props;
    const { builder } = options;
    builder.fields = builder.fields.filter((element: any, idx: number) => index !== idx);
    onOptionsChange({ ...options, builder });
    this.setState(({ components }) => ({
      components: components.filter((element: string, idx: number) => {
        return idx !== index;
      }),
    }));
  };

  render() {
    const { builder } = this.props.options;
    const { components } = this.state;
    return (
      <>
        <div className="gf-form">
          <div
            className={css`
              width: 300px;
            `}
          >
            <FormField
              label="Name"
              name="name"
              type="text"
              placeholder="Output name for the summed value"
              value={builder.name}
              onChange={this.onInputChange}
            />
            <label className="gf-form-label">Dimensions</label>
            <div>
              {builder.fields.map((item: any, index: number) => (
                <ComponentRow
                  key={components[index]}
                  index={index}
                  component={Dimension}
                  props={{
                    options: this.componentOptions(index),
                    onOptionsChange: this.onComponentOptionsChange.bind(this, index),
                  }}
                  onRemove={this.onComponentRemove}
                />
              ))}
            </div>
            <Button variant="secondary" icon="plus" onClick={this.onComponentAdd}>
              Add dimension
            </Button>
            <Checkbox
              value={builder.byRow}
              onChange={this.onCheckboxChange.bind(this, 'byRow')}
              label="By row"
              description="Set to true to computes the cardinality by row, i.e. the cardinality of distinct dimension combinations"
            />
            <Checkbox
              value={builder.round}
              onChange={this.onCheckboxChange.bind(this, 'round')}
              label="Round"
              description="Set to true to round off estimated values to whole numbers"
            />
          </div>
        </div>
      </>
    );
  }
}

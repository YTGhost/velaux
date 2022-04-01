import React, { Component } from 'react';
import { Loading, Select } from '@b-design/ui';
import i18n from '../../i18n';
import locale from '../../utils/locale';
import { getChartRepos } from '../../api/repository';
import type { HelmRepo } from '../../interface/application';
import { connect } from 'dva';

type Props = {
  value?: any;
  onChange: (value: any) => void;
  id: string;
  disabled: boolean;
  dispatch?: ({}) => {};
  helm?: { repoType: string };
  project?: string;
};

type State = {
  repos: HelmRepo[];
  inputRepo: string;
  loading: boolean;
};
@connect((store: any) => {
  return { ...store.uischema };
})
class HelmRepoSelect extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
      repos: [],
      inputRepo: '',
    };
  }
  componentDidMount() {
    if (!this.props.helm?.repoType || this.props.helm?.repoType == 'helm') {
      this.onLoadRepos();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const repoType = nextProps.helm?.repoType;
    if (repoType !== this.props.helm?.repoType && repoType == 'helm') {
      this.onLoadRepos();
    }
  }

  onLoadRepos = () => {
    const { project } = this.props;
    const defaultRepos = [{ url: 'https://charts.bitnami.com/bitnami', type: 'helm' }];
    this.setState({ loading: true, repos: defaultRepos });
    getChartRepos({ project: project }).then((res) => {
      let repos: HelmRepo[] = [];
      if (res && res.repos) {
        repos = repos.concat(res.repos);
      }
      repos = repos.concat(defaultRepos);
      this.setState({
        repos: repos,
        loading: false,
      });
    });
  };

  onSearch = (value: string) => {
    this.setState({ inputRepo: value });
  };

  onChange = (value: string) => {
    const { onChange, dispatch } = this.props;
    this.state.repos.map((repo) => {
      if (repo.url == value && repo.secretName != '' && dispatch) {
        dispatch({
          type: 'uischema/setHelmRepo',
          payload: repo,
        });
      }
    });
    onChange(value);
  };

  render() {
    const { disabled, value } = this.props;
    const { repos, loading, inputRepo } = this.state;
    const dataSource = repos.map((repo) => repo.url);
    if (inputRepo) {
      dataSource.unshift(inputRepo);
    }
    return (
      <Loading visible={loading} style={{ width: '100%' }}>
        <Select
          placeholder={i18n.t('Please select or input your owner helm repo')}
          onChange={this.onChange}
          inputMode="url"
          disabled={disabled}
          showSearch={true}
          onSearch={this.onSearch}
          followTrigger={true}
          value={value}
          dataSource={dataSource}
          locale={locale.Select}
        />
      </Loading>
    );
  }
}

export default HelmRepoSelect;
const moment = require('moment');

const genList = (current, pageSize) => {
  const tableListDataSource = [];

  for (let i = 0; i < pageSize; i += 1) {
    const index = (current - 1) * 10 + i;
    tableListDataSource.push({
      key: index,
      disabled: i % 6 === 0,
      href: 'https://ant.design',
      avatar: [
        'https://gw.alipayobjects.com/zos/rmsportal/eeHMaZBwmTvLdIwMfBpg.png',
        'https://gw.alipayobjects.com/zos/rmsportal/udxAbMEhpwthVVcjLXik.png',
      ][i % 2],
      name: `TradeCode ${index}`,
      owner: '曲丽丽',
      desc: '这是一段描述',
      callNo: Math.floor(Math.random() * 1000),
      status: Math.floor(Math.random() * 10) % 4,
      updatedAt: moment().format('YYYY-MM-DD'),
      createdAt: moment().format('YYYY-MM-DD'),
      progress: Math.ceil(Math.random() * 100),
    });
  }
  tableListDataSource.reverse();
  return tableListDataSource;
};

let tableListDataSource = genList(1, 100);

exports.handler = async (event, context) => {
  try {
    const { queryStringParameters } = event;
    const { current = 1, pageSize = 10, sorter, filter, name } = queryStringParameters;

    let dataSource = [...tableListDataSource].slice(
      ((current as number) - 1) * (pageSize as number),
      (current as number) * (pageSize as number),
    );
    if (sorter) {
      const sortField = Object.keys(JSON.parse(sorter))[0];
      const sortOrder = JSON.parse(sorter)[sortField];
      dataSource = dataSource.sort((prev, next) => {
        let sortNumber = 0;
        (Object.keys(sorter) as Array<keyof API.RuleListItem>).forEach((key) => {
          let nextSort = next?.[key] as number;
          let preSort = prev?.[key] as number;
          if (sorter[key] === 'descend') {
            if (preSort - nextSort > 0) {
              sortNumber += -1;
            } else {
              sortNumber += 1;
            }
            return;
          }
          if (preSort - nextSort > 0) {
            sortNumber += 1;
          } else {
            sortNumber += -1;
          }
        });
        return sortNumber;
      });
    }
    if (filter) {
      const filterObject = JSON.parse(filter);
      dataSource = dataSource.filter(item => {
        return Object.keys(filterObject).some(key => {
          const filterValues = filterObject[key];
          const itemValue = item[key];
          return filterValues.includes(`${itemValue}`);
        });
      });
    }

    if (name) {
      dataSource = dataSource.filter((data) => data?.name?.includes(name));
    }
    const result = {
      data: dataSource,
      total: tableListDataSource.length,
      success: true,
      pageSize: parseInt(pageSize, 10),
      current: parseInt(current, 10) || 1,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};

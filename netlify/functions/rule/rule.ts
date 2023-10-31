exports.handler = async (event, context) => {
  try {
    const tableListDataSource: API.RuleListItem[] = [];
    const { queryStringParameters } = event;
    const { current = 1, pageSize = 10, sorter, filter, name } = queryStringParameters;

    let dataSource = tableListDataSource.slice(
      (current - 1) * pageSize,
      current * pageSize
    );

    if (sorter) {
      const sortField = Object.keys(JSON.parse(sorter))[0];
      const sortOrder = JSON.parse(sorter)[sortField];
      dataSource = dataSource.sort((prev, next) => {
        const preSort = prev[sortField];
        const nextSort = next[sortField];

        if (sortOrder === 'descend') {
          return preSort - nextSort;
        } else {
          return nextSort - preSort;
        }
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
      dataSource = dataSource.filter(data => data.name.includes(name));
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

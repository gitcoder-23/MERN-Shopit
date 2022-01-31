class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  // search
  search() {
    const keyword = this.queryStr.keyword
      ? {
          // search by name
          name: {
            $regex: this.queryStr.keyword,
            // to case "insencetive"
            $options: 'i',
          },
        }
      : {};
    // console.log('keyword->', keyword);
    this.query = this.query.find({ ...keyword });
    return this;
  }

  // Filter
  filter() {
    const queryCopy = { ...this.queryStr };
    // console.log('queryCopy->', queryCopy);
    // Removing fields from the query string
    const removeFields = ['keyword', 'limit', 'page'];
    removeFields.forEach((el) => delete queryCopy[el]);
    // console.log('after-delqueryCopy->', queryCopy);

    // console.log('queryCopy->', queryCopy);

    // Advanced filter for "price", "rating" etc..

    let queryStr = JSON.stringify(queryCopy);
    // for price[gte]=1&price[lte]=200

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
    // console.log('queryStr->', queryStr);

    // "errMessage": "Unexpected token o in JSON at position 1", solved

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Pagination
  pagination(productPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    // "currentPage"-> the page which is viewed (pageNo.)
    // "productPerPage" -> is 4
    const skip = productPerPage * (currentPage - 1);
    // "limit" the no. of documents
    this.query = this.query.limit(productPerPage).skip(skip);
    return this;
  }
}

module.exports = APIFeatures;

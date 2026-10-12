import React, { useContext } from 'react';
import { DataTableContext, TableFooter } from '@openedx/paragon';
import { Pagination } from '@src/generic/translated-paragon';

const Footer = () => {
  const {
    pageOptions,
    pageCount,
    gotoPage,
    state,
  } = useContext(DataTableContext);

  if (pageOptions.length < 2) {
    return null;
  }

  const pageIndex = state?.pageIndex;

  return (
    <TableFooter>
      <Pagination
        size="small"
        currentPage={pageIndex + 1}
        pageCount={pageCount}
        onPageSelect={(pageNum) => gotoPage(pageNum - 1)}
      />
    </TableFooter>
  );
};

export default Footer;

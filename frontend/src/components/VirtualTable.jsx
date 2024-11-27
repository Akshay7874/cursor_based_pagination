import React from 'react';
import { useInfiniteQuery } from 'react-query';
import { FixedSizeList as List } from 'react-window';
import axios from 'axios';

const fetchOrders = async ({ pageParam = null }) => {
    const { data } = await axios.get('http://localhost:3001/orders', {
        params: { cursor: pageParam, limit: 10, sort: 'createdAt', sortDirection: 'asc' },
    });
    return data;
};

const VirtualTable = () => {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery('orders', fetchOrders, {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    const orders = data?.pages.flatMap((page) => page.data) ?? [];

    const loadMoreRows = () => {
        if (!isFetchingNextPage && hasNextPage) {
            fetchNextPage();
        }
    };

    const renderRow = ({ index, style }) => {
        const order = orders[index];
        return (
            <div style={style} className="row" key={order._id} role="row">
                <div style={{ width: '25%', padding: '8px' }}>{order.customerName}</div>
                <div style={{ width: '25%', padding: '8px' }}>{order.orderAmount.toFixed(2)}</div>
                <div style={{ width: '25%', padding: '8px' }}>{order.status}</div>
                <div style={{ width: '25%', padding: '8px' }}>
                    {new Date(order.createdAt).toLocaleString()}
                </div>
            </div>
        );
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div style={{ height: 400, width: '100%', overflow: 'auto' }}>
            <div style={{ display: 'flex', fontWeight: 'bold', borderBottom: '1px solid #ddd' }}>
                <div style={{ width: '25%', padding: '8px' }}>Customer Name</div>
                <div style={{ width: '25%', padding: '8px' }}>Order Amount</div>
                <div style={{ width: '25%', padding: '8px' }}>Status</div>
                <div style={{ width: '25%', padding: '8px' }}>Created At</div>
            </div>
            <List
                height={350}
                itemCount={orders.length}
                itemSize={50}
                onItemsRendered={({ visibleStopIndex }) => {
                    if (visibleStopIndex === orders.length - 1 && hasNextPage) {
                        loadMoreRows();
                    }
                }}
                width="100%"
            >
                {renderRow}
            </List>
            <div className='button-container'>
                <button>Previous</button>
                <button>Next</button>
            </div>
            {isFetchingNextPage && <div>Loading more...</div>}
        </div>
    );
};

export default VirtualTable;

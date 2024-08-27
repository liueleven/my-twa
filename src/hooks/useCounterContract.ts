import { useEffect, useState } from 'react';
import Counter from '../contracts/counter';
import { useTonClient } from './useTonClient';
import { useAsyncInitialize } from './useAsyncInitialize';
import { useTonConnect } from './useTonConnect';
import { Address, OpenedContract } from '@ton/core';
import dotenv from 'dotenv';

dotenv.config();

export function useCounterContract() {
    const client = useTonClient();
    const [val, setVal] = useState<null | number>();
    const { sender } = useTonConnect();
    const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

    const counterContract = useAsyncInitialize(async () => {
        if (!client) return;
        // const address = process.env.ADDRESS;
        const address = "EQBYLTm4nsvoqJRvs_L-IGNKwWs5RKe19HBK_lFadf19FUfb";
        if (!address) return;
        const contract = new Counter(
            Address.parse(address) // replace with your address from tutorial 2 step 8
        );
        return client.open(contract) as OpenedContract<Counter>;
    }, [client]);
    // alert(counterContract);
    useEffect(() => {
        async function getValue() {
            if (!counterContract) return;
            setVal(null);
            const val = await counterContract.getCounter();
            setVal(Number(val.toString()));
            await sleep(5000); // sleep 5 seconds and poll value again
            getValue();
        }
        getValue();
    }, [counterContract]);

    return {
        value: val,
        address: counterContract?.address.toString(),
        sendIncrement: () => {
            return counterContract?.sendIncrement(sender);
        },
    };
}


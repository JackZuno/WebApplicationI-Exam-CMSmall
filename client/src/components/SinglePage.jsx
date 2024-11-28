import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

import { Row, Col, Button } from 'react-bootstrap';

import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isSameOrBefore)

import MessageContext from '../messageCtx';

import API from '../API';

export default function SinglePage(props) {
    const {handleErrors} = useContext(MessageContext);
    const params = useParams();
    const navigate = useNavigate();
    //list of black of the current page
    const [ blocks, setBlocks ] = useState();
    let blocksInfo;
    let blocksArr;
    let lengthArr;

    useEffect(()=> {
        // get all the pages from API
        const getPageBlocks = async () => {
            const pageDb = await API.getPage(params.id);
            setBlocks(pageDb);
            if(pageDb.error) {
                handleErrors(pageDb)
                navigate('/*')
            }

            if(!props.user && (!pageDb[0].pubdate || !dayjs(pageDb[0].pubdate).isSameOrBefore(dayjs().format('YYYY-MM-DD')))) {
                navigate('/')
            }
        }

        getPageBlocks();
    }, []);

    if(blocks) {
        blocksInfo = blocks[0];
        blocksArr = blocks;
        lengthArr = blocks.length;
    }

    const print = (b) => {
        if(b.type === "header") {
            return (
                <>
                    <h4 className='page-content'>{b.content}</h4>
                    {/*{ props.user && b.position != 1 && (props.user.role === "Admin" || props.user.id === blocksInfo.id) ? <Button className='action-icon'><i className='action-icon'><Icon icon="icon-park-outline:up-two" width={24}/></i></Button> : <></> }
                    { props.user && lengthArr != b.position && (props.user.role === "Admin" || props.user.id === blocksInfo.id) ? <Button className='action-icon'><i className='action-icon'><Icon icon="icon-park-outline:down-two" width={24}/></i></Button> : <></> }*/}
                </>
            );
        }

        if(b.type === "paragraph") {
            return (
                <>
                    <p className='page-content'>{b.content}</p>
                    {/*{ props.user && b.position != 1 && (props.user.role === "Admin" || props.user.id === blocksInfo.id) ? <Button className='action-icon'><i className='action-icon'><Icon icon="icon-park-outline:up-two" width={24}/></i></Button> : <></> }
                    { props.user && lengthArr != b.position && (props.user.role === "Admin" || props.user.id === blocksInfo.id) ? <Button className='action-icon'><i className='action-icon'><Icon icon="icon-park-outline:down-two" width={24}/></i></Button> : <></> }*/}
                </>
            );
        }

        if(b.type === "image") {
            const source = b.content;
            return (
                <>
                    <img className='page-content' src={source} width={500}/>
                    {/*{ props.user && b.position != 1 && (props.user.role === "Admin" || props.user.id === blocksInfo.id) ? <Button className='action-icon'><i className='action-icon'><Icon icon="icon-park-outline:up-two" width={24}/></i></Button> : <></> }
                    { props.user && lengthArr != b.position && (props.user.role === "Admin" || props.user.id === blocksInfo.id) ? <Button className='action-icon'><i className='action-icon'><Icon icon="icon-park-outline:down-two" width={24}/></i></Button> : <></> }*/}
                </>
            );
        }

        return (
            <></>
        );
    };

    const printSituation = (b) => {
        const currentDate = dayjs();
        if(!b.pubdate) {
            return (
                <h6 className='info-page text-end'><span className="badge rounded-pill text-bg-danger text-end">Draft</span></h6>
            );
        }

        if(b.pubdate && b.pubdate > currentDate) {
            return (
                <h6 className='info-page text-end'><span className="badge rounded-pill text-bg-warning text-end">Scheduled</span> ({b.pubdate.format('YYYY-MMMM-DD')})</h6>
            );
        }

        return (
            <h6 className='info-page text-end'><span className="badge rounded-pill text-bg-success text-end">Published</span> ({b.pubdate.format('YYYY-MMMM-DD')})</h6>
        );
    };
    
    return (
        <>
            <Row>
                <Col>
                </Col>
                <Col xs={6}>
                    <h1 className='page-content'>{ blocksInfo ? blocksInfo.title : <></>}</h1>
                    {
                        blocksArr ?
                        blocksArr.map((b) => <SingleBlock block={b} key={b.idblock} print={print}/>) : <></>
                    }
                </Col>
                <Col>
                    { blocksInfo ? <h6 className='info-page text-end'>Written by {blocksInfo.author} on {blocksInfo.creationdate.format('YYYY-MMMM-DD')}</h6> : <></>} 
                    { blocksInfo ? printSituation(blocksInfo) : <></> }
                </Col>
            </Row>
        </>
    );
}

function SingleBlock(props) {
    return (
        <>
            {props.print(props.block)}
        </>
    );
}
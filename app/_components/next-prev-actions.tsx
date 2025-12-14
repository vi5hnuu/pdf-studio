import {Button, CardActions} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import * as React from "react";

export function NextPrevActions({onPrev, onNext, prevDisabled, nextDisabled}: {
    onPrev: () => void,
    onNext: () => void,
    prevDisabled: boolean,
    nextDisabled: boolean
}) {
    return (<CardActions
        className='absolute m-4 flex gap-1 !p-0 bg-gray-100 overflow-hidden rounded-full top-0 right-0'>
        <Button onClick={onPrev} className='!py-3' disabled={prevDisabled}>
            <NavigateBeforeIcon/>
            <span>Previous</span>
        </Button>
        <Button onClick={onNext} className='!py-3'
                disabled={nextDisabled}>
            <span>Next</span>
            <NavigateNextIcon/>
        </Button>
    </CardActions>);
}
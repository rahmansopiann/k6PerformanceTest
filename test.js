import http from "k6/http";
import { sleep, check } from "k6";
import runTestOne from "./script1.js";
import runTestTwo from "./script2.js";

export default function() {
    runTestOne();
    runTestTwo();
};
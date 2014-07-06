#!/bin/sh
ENV=$(which env)
NODE=$(which node)

$ENV NODE_ENV=production $NODE src/app

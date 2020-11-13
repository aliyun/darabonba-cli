# -*- coding: utf-8 -*-
# This file is auto-generated, don't edit it. Thanks.
from Tea.core import TeaCore


class Client(object):
    def __init__(self):
        pass

    @staticmethod
    def hello_map():
        m = {}
        return TeaCore.merge({
            "key": "value",
            "key-1": "value-1"
        }, m)

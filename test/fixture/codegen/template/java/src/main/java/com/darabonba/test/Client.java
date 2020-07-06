// This file is auto-generated, don't edit it. Thanks.
package com.darabonba.test;

import com.aliyun.tea.*;


public class Client {

    public static java.util.Map<String, String> helloMap() throws Exception {
        java.util.Map<String, String> m = new java.util.HashMap<>();
        return TeaConverter.merge(String.class,
            TeaConverter.buildMap(
                new TeaPair("key", "value"),
                new TeaPair("key-1", "value-1")
            ),
            m
        );
    }
}

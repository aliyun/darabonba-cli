// This file is auto-generated, don't edit it. Thanks.
package com.darabonba.test;

import darabonba.core.utils.*;

/**
 * <p>Main client.</p>
 */
public final class DefaultAsyncClient {



    public static CompletableFuture<java.util.Map<String, String>> helloMap() {
        try {
            java.util.Map<String, String> m = new java.util.HashMap<>();
            return CommonUtil.merge(String.class,
                CommonUtil.buildMap(
                    new TeaPair("key", "value"),
                    new TeaPair("key-1", "value-1")
                ),
                m
            );
        } catch (Exception e) {
            CompletableFuture<java.util.Map<String, String>> future = new CompletableFuture<>();
            future.completeExceptionally(e);
            return future;
        }
    }

}
